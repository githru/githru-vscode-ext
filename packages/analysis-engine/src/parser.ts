import { execSync } from "child_process";
import { CommitRaw, DifferenceStatistic, GitUser } from "./types/CommitRaw";

export function getGitLog(path: string) {
  const command = `${path} --no-pager log --all --parents --numstat --date-order --pretty=fuller --decorate -c`;
  return execSync(command, { encoding: "utf8" });
}

function getNameAndEmail(category: GitUser[], preParsedInfo: string) {
  category.push({
    name: preParsedInfo.split(": ")[1].split("<")[0].trim(),
    email: preParsedInfo.split(": ")[1].split("<")[1].split(">")[0].trim(),
  });
}

export function getCommitRaws(log: string) {
  if (!log) return [];

  // line 별로 분리하기
  const splitByNewLine = log.split(/\r?\n/);

  // 분리한 것들을 쭉 돌면서 각 카테고리별로 담을 예정
  type Refs = string[];

  const ids: string[] = [];
  const parentsMatrix: string[][] = [];
  const branchesMatrix: Refs[] = [];
  const tagsMatrix: Refs[] = [];
  const authors: GitUser[] = [];
  const authorDates: Date[] = [];
  const committers: GitUser[] = [];
  const commitDates: Date[] = [];
  const messages: string[] = [];
  const differenceStatistics: DifferenceStatistic[] = [];

  // commit별 fileChanged를 분리시키기 위한 임시 index
  let commitIdx = -1;

  if (splitByNewLine) {
    splitByNewLine.forEach((str, idx) => {
      if (str.startsWith("commit")) {
        commitIdx += 1;
        tagsMatrix.push([]);
        branchesMatrix.push([]);
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
        parentsMatrix.push(commitInfos);
        const branchAndTagInfos = splitedCommitLine[1]
          ?.replace(")", "")
          .replace(" -> ", ", ")
          .split(", ");
        if (branchAndTagInfos) {
          branchAndTagInfos.forEach((branchAndTagInfo) => {
            if (branchAndTagInfo.startsWith("tag:"))
              return tagsMatrix[commitIdx].push(
                branchAndTagInfo.replace("tag: ", "")
              );
            return branchesMatrix[commitIdx].push(branchAndTagInfo);
          });
        }
        return false;
      }
      if (str.startsWith("Author:")) return getNameAndEmail(authors, str);
      if (str.startsWith("AuthorDate"))
        return authorDates.push(new Date(str.split(": ")[1].trim()));
      if (str.startsWith("Commit:")) return getNameAndEmail(committers, str);
      if (str.startsWith("CommitDate")) {
        let indexCheckFileChanged = idx + 2;
        let eachCommitMessage = "";
        while (splitByNewLine[indexCheckFileChanged] !== "") {
          if (eachCommitMessage !== "") {
            eachCommitMessage += "\n";
          }
          eachCommitMessage += splitByNewLine[indexCheckFileChanged].trim();
          indexCheckFileChanged += 1;
        }
        commitDates.push(new Date(str.split(": ")[1].trim()));
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
  const commitRaws: CommitRaw[] = [];

  // 카테고리 별로 담은 것을 JSON화 시키기
  for (let i = 0; i < ids.length; i += 1) {
    commitRaws.push({
      sequence: i,
      id: ids[i],
      parents: parentsMatrix[i],
      branches: branchesMatrix[i],
      tags: tagsMatrix[i],
      author: authors[i],
      authorDate: authorDates[i],
      committer: committers[i],
      committerDate: commitDates[i],
      message: messages[i],
      differenceStatistic: differenceStatistics[i],
    });
  }

  return commitRaws;
}
