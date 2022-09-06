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
  const differenceStatistics: DifferenceStatistic[] = [];

  // commit별 fileChanged를 분리시키기 위한 임시 index
  let commitIdx = -1;
  if (typeof splitByNewLine !== "undefined") {
    splitByNewLine.forEach((str, idx) => {
      if (str.startsWith("commit")) {
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
          .filter((e) => e);
        ids.push(commitInfos[0]);
        commitInfos.splice(0, 1);
        parents.push(commitInfos);
        let branchAndTagsInfos = splitedCommitLine[1];
        if (typeof branchAndTagsInfos !== "undefined") {
          if (branchAndTagsInfos.startsWith("HEAD ->")) {
            [, branchAndTagsInfos] = branchAndTagsInfos.split("HEAD ->");
          }
          branchAndTagsInfos.split(",").forEach((eachInfo) => {
            if (eachInfo.trim().startsWith("tag:"))
              return tags[commitIdx].push(eachInfo.replace("tag: ", "").trim());
            return branches[commitIdx].push(eachInfo.replace(")", "").trim());
          });
        }
      }
      if (str.startsWith("Author:")) return getNameAndEmail(authors, str);
      if (str.startsWith("AuthorDate"))
        return authorDates.push(str.split(": ")[1].trim());
      if (str.startsWith("Commit:")) return getNameAndEmail(committers, str);
      if (str.startsWith("CommitDate")) {
        let indexCheckFileChanged = idx + 2;
        let eachCommitMessage = "";
        while (splitByNewLine[indexCheckFileChanged] !== "") {
          if (eachCommitMessage !== "") {
            eachCommitMessage += "/n";
          }
          eachCommitMessage += splitByNewLine[indexCheckFileChanged].trim();
          indexCheckFileChanged += 1;
        }
        commitDates.push(str.split(": ")[1].trim());
        messages.push(eachCommitMessage);
      }
      if (/^\d/.test(str) || /^-/.test(str)) {
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
      return false;
    });
  }

  // 각 카테고리로 담은 다음 다시 JSON으로 변환하기 위함
  const JSONArray: CommitRaw[] = [];

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
