import { CommitRaw, DifferenceStatistic, FileChanged } from "./types/CommitRaw";
import { exampleDataPrivate, exampleDataFlutter } from "./tempData";

declare let JSONArray: CommitRaw[];
declare let eachDifferenceStatistic: DifferenceStatistic;
declare let eachLine: FileChanged;

export function parseToJSON(log: string) {
  // line 별로 분리하기
  const splitByNewLine = log.split(/\r?\n/);

  // 분리한 것들을 쭉 돌면서 각 카테고리별로 담을 예정
  const ids: string[] = [];
  const parents: string[][] = [];
  const branches: string[][] = [];
  const tags: string[][] = [];
  // const authors: string[] = [];
  // const authorDates: string[] = [];
  // const committers: string[] = [];
  // const committerEmails: string[] = [];
  // const commitDates: string[] = [];
  // const messages: string[] = [];
  // fileChanged의 경우 2개 이상이 될 수 있으므로 배열로 지정
  const differenceStatistics: DifferenceStatistic[] = [];

  // 각 카테고리로 담은 다음 다시 JSON으로 변환하기 위함
  // const JSONArray: CommitRaw[] = [];

  // commit별 fileChanged를 분리시키기 위한 임시 index
  let commitIdx = -1;

  if (typeof splitByNewLine !== undefined) {
    splitByNewLine.map((str) => {
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
        // } else if (str.slice(0, 7) === "Author:") {
        //   authors.push(str.split(": ")[1].split("<")[0].trim());
        //   authorEmails.push(
        //     str.split(": ")[1].split("<")[1].split(">")[0].trim()
        //   );
        // } else if (str.slice(0, 10) === "AuthorDate") {
        //   authorDates.push(str.split(": ")[1].trim());
        // } else if (str.slice(0, 7) === "Commit:") {
        //   committers.push(str.split(": ")[1].trim());
        //   committerEmails.push(
        //     str.split(": ")[1].split("<")[1].split(">")[0].trim()
        //   );
        //   messages.push(splitByNewLine[idx + 3].trim());
        // } else if (str.slice(0, 10) === "CommitDate") {
        //   commitDates.push(str.split(": ")[1].trim());
        // }
        // // fileChanged의 경우 각 commit 별 여러 개가 될 수 있으니 commit 별로 나눠줘야 한다.
        // else if (/^\d/.test(str)) {
        //   const eachLine: FileChanged = {
        //     addition: null,
        //     deletion: null,
        //     directory: null,
        //   };
        //   eachLine.addition = Number(str.split(" ").join("").split("\t")[0]);
        //   eachLine.deletion = Number(str.split(" ").join("").split("\t")[1]);
        //   eachLine.directory = str.split(" ").join("").split("\t")[2];
        //   fileChangeds[commitIdx].push(eachLine);
      }
    });
  }
  console.log("ids", ids);
  console.log("parents", parents);
  console.log("tags", tags);
  console.log("branches", branches);

  // console.log("commit", ids);
  // console.log("author", authors);
  // console.log("authorEmail", authorEmails);
  // console.log("authorDate", authorDates);
  // console.log("Committer", committers);
  // console.log("CommitterEmail", committerEmails);
  // console.log("CommitDate", commitDates);
  // console.log("message", messages);
  // console.log("fileChanged", fileChangeds);

  // 카테고리 별로 담은 것을 JSON화 시키기
  // for (let i = 0; i < commits.length; i++) {
  //   JSONArray.push({
  //     commit: null,
  //     Author: null,
  //     AuthorEmail: null,
  //     AuthorDate: null,
  //     Committer: null,
  //     CommitterEmail: null,
  //     CommitDate: null,
  //     message: null,
  //     fileChanged: [],
  //   });
  //   JSONArray[i]["commit"] = commits[i];
  //   JSONArray[i]["Author"] = authors[i];
  //   JSONArray[i]["AuthorEmail"] = authorEmails[i];
  //   JSONArray[i]["AuthorDate"] = authorDates[i];
  //   JSONArray[i]["Committer"] = committers[i];
  //   JSONArray[i]["CommitterEmail"] = committerEmails[i];
  //   JSONArray[i]["CommitDate"] = commitDates[i];
  //   JSONArray[i]["message"] = messages[i];
  //   JSONArray[i]["fileChanged"] = fileChangeds[i];
  // }

  // console.log(JSONArray);
  // return JSONArray;
}

parseToJSON(exampleDataPrivate);
parseToJSON(exampleDataFlutter);
