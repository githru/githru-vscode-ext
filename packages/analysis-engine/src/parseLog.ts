import { inspect } from "util";
import { CommitRaw, DifferenceStatistic, GitUser } from "./types/CommitRaw";

function getNameAndEmail(category: GitUser[], preParsedInfo: string) {
  category.push({
    name: preParsedInfo.split(": ")[1].split("<")[0].trim(),
    email: preParsedInfo.split(": ")[1].split("<")[1].split(">")[0].trim(),
  });
}

export default function parseToJSON(log: string) {
  // line 별로 분리하기
  const splitByNewLine = log.split(/\r?\n/);
  // 분리한 것들을 쭉 돌면서 각 카테고리별로 담을 예정
  const ids: string[] = [];
  const parents: string[][] = [];
  const branches: string[][] = [];
  const tags: string[][] = [];
  const authors: GitUser[] = [];
  const authorDates: string[] = [];
  const committers: GitUser[] = [];
  const commitDates: string[] = [];
  const messages: string[] = [];
  // fileChanged의 경우 2개 이상이 될 수 있으므로 배열로 지정
  const differenceStatistics: DifferenceStatistic[] = [];

  // 각 카테고리로 담은 다음 다시 JSON으로 변환하기 위함
  const JSONArray: CommitRaw[] = [];

  // commit별 fileChanged를 분리시키기 위한 임시 index
  let commitIdx = -1;
  if (typeof splitByNewLine !== "undefined") {
    splitByNewLine.forEach((str, idx) => {
      if (str.slice(0, 6) === "commit") {
        commitIdx += 1;
        tags.push([]);
        branches.push([]);
        differenceStatistics.push({
          totalInsertionCount: 0,
          totalDeletionCount: 0,
          fileDictionary: {},
        });
        const splitedCommitLine = str.split("(");
        const commitInfos = splitedCommitLine[0]
          .replace("commit ", "")
          .split(" ")
          .filter((commit) => commit !== "");
        ids.push(commitInfos[0]);
        commitInfos.splice(0, 1);
        parents.push(commitInfos);
        let branchAndTagsInfos = splitedCommitLine[1];
        if (typeof branchAndTagsInfos !== "undefined") {
          if (branchAndTagsInfos.slice(0, 7) === "HEAD ->") {
            [, branchAndTagsInfos] = branchAndTagsInfos.split("HEAD ->");
          }
          branchAndTagsInfos.split(",").forEach((eachInfo) => {
            if (eachInfo.trim().slice(0, 4) === "tag:") {
              tags[commitIdx].push(eachInfo.replace("tag: ", "").trim());
            } else {
              branches[commitIdx].push(eachInfo.replace(")", "").trim());
            }
          });
        }
      } else if (str.slice(0, 7) === "Author:") {
        getNameAndEmail(authors, str);
      } else if (str.slice(0, 10) === "AuthorDate") {
        authorDates.push(str.split(": ")[1].trim());
      } else if (str.slice(0, 7) === "Commit:") {
        getNameAndEmail(committers, str);
      } else if (str.slice(0, 10) === "CommitDate") {
        let indexCheckFileChanged = idx + 2;
        let eachCommitMessage = "";
        while (splitByNewLine[indexCheckFileChanged] !== "") {
          if (eachCommitMessage !== "") {
            eachCommitMessage += "/n";
            eachCommitMessage += splitByNewLine[indexCheckFileChanged].trim();
          } else {
            eachCommitMessage += splitByNewLine[indexCheckFileChanged].trim();
          }
          indexCheckFileChanged += 1;
        }
        commitDates.push(str.split(": ")[1].trim());
        messages.push(eachCommitMessage);
      } else if (/^\d/.test(str) || /^-/.test(str)) {
        const [addition, deletion, path] = str
          .split(" ")
          .filter((e) => e)[0]
          .split("\t");
        const numberedAddition = addition === "-" ? 0 : Number(addition);
        const numberedDeletion = deletion === "-" ? 0 : Number(deletion);
        differenceStatistics[commitIdx].totalInsertionCount += numberedAddition;
        differenceStatistics[commitIdx].totalDeletionCount += numberedDeletion;
        differenceStatistics[commitIdx].fileDictionary[path] = {
          insertionCount: numberedAddition,
          deletionCount: numberedDeletion,
        };
      }
    });
  }

  // 카테고리 별로 담은 것을 JSON화 시키기
  for (let i = 0; i < ids.length; i += 1) {
    JSONArray.push({
      sequence: i,
      id: ids[i],
      parents: parents[i],
      branches: branches[i],
      tags: tags[i],
      author: authors[i],
      authorDate: authorDates[i],
      committer: committers[i],
      committerDate: commitDates[i],
      message: messages[i],
      differenceStatistic: differenceStatistics[i],
    });
  }

  return inspect(JSONArray, {
    showHidden: false,
    depth: null,
    colors: true,
    maxArrayLength: null,
  });
}
