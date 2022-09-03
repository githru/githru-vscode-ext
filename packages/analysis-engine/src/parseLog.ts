import {
  CommitRaw,
  DifferenceStatistic,
  FileChanged,
  GitUser,
} from "./types/CommitRaw";
import { exampleDataPrivate, exampleDataFlutter } from "./tempData";

declare let JSONArray: CommitRaw[];
declare let eachDifferenceStatistic: DifferenceStatistic;
declare let eachLine: FileChanged;
declare let eachUser: GitUser;

export function parseToJSON(log: string) {
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
  if (typeof splitByNewLine !== undefined) {
    splitByNewLine.map((str, idx) => {
      if (str.slice(0, 6) === "commit") {
        commitIdx += 1;
        tags.push([]);
        branches.push([]);
        differenceStatistics.push({
          totalInsertionCount: 0,
          totalDeletionCount: 0,
          fileDictionary: {},
        });
        let splitedCommitLine = str.split("(");
        let commitInfos = splitedCommitLine[0]
          .replace("commit ", "")
          .split(" ")
          .filter((commit) => {
            return commit !== "";
          });
        ids.push(commitInfos[0]);
        commitInfos.splice(0, 1);
        parents.push(commitInfos);
        let branchAndTagsInfos = splitedCommitLine[1];
        if (branchAndTagsInfos) {
          if (branchAndTagsInfos.slice(0, 7) === "HEAD ->") {
            branchAndTagsInfos = branchAndTagsInfos.split("HEAD ->")[1];
          }
          branchAndTagsInfos.split(",").map((eachInfo) => {
            eachInfo = eachInfo.trim();
            if (eachInfo.slice(0, 4) === "tag:") {
              tags[commitIdx].push(eachInfo.replace("tag: ", ""));
            } else {
              branches[commitIdx].push(eachInfo.replace(")", ""));
            }
          });
        }
      } else if (str.slice(0, 7) === "Author:") {
        authors.push({
          name: str.split(": ")[1].split("<")[0].trim(),
          email: str.split(": ")[1].split("<")[1].split(">")[0].trim(),
        });
      } else if (str.slice(0, 10) === "AuthorDate") {
        authorDates.push(str.split(": ")[1].trim());
      } else if (str.slice(0, 7) === "Commit:") {
        committers.push({
          name: str.split(": ")[1].split("<")[0].trim(),
          email: str.split(": ")[1].split("<")[1].split(">")[0].trim(),
        });
      } else if (str.slice(0, 10) === "CommitDate") {
        let indexCheckFileChanged = idx + 2;
        let eachCommitMessage = "";
        while (true) {
          if (splitByNewLine[indexCheckFileChanged] === "") {
            break;
          }
          if (eachCommitMessage != "") {
            eachCommitMessage +=
              "\n" + splitByNewLine[indexCheckFileChanged].trim();
          } else {
            eachCommitMessage += splitByNewLine[indexCheckFileChanged].trim();
          }
          indexCheckFileChanged++;
        }
        commitDates.push(str.split(": ")[1].trim());
        messages.push(eachCommitMessage);
      } else if (/^\d/.test(str) || /^-/.test(str)) {
        let [addition, deletion, path] = str.split(" ").filter((e) => e);
        let numberedAddition = addition === "-" ? 0 : Number(addition);
        let numberedDeletion = deletion === "-" ? 0 : Number(deletion);
        differenceStatistics[commitIdx].totalInsertionCount += numberedAddition;
        differenceStatistics[commitIdx].totalDeletionCount += numberedDeletion;
        differenceStatistics[commitIdx].fileDictionary[path.toString()] = {
          insertionCount: numberedAddition,
          deletionCount: numberedDeletion,
        };
      }
    });
  }

  // 카테고리 별로 담은 것을 JSON화 시키기
  for (let i = 0; i < ids.length; i++) {
    JSONArray.push({
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

  console.log(JSONArray);
  return JSONArray;
}

parseToJSON(exampleDataPrivate);
parseToJSON(exampleDataFlutter);
