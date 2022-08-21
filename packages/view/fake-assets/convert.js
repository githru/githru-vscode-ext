// import commitTaskList from './commit_task_list.json';
const commitTaskList = require('./commit_task_list.json');

const commitRawMap = {};
const commitMap = {};
const commitNodeList = [];
const commitNodeMapByTaskId = {};
const clusterNodeList = [];

function getUserInfo(user) {
    let [name, email] = user.split("<");
    email = email.split(">")[0];

    return [name, email];
}

for (const commitTask of commitTaskList) {
    const commitRaw = commitTask.commit;
    commitRawMap[commitRaw.id] = commitRaw;
    
    const [authorName, authorEmail] = getUserInfo(commitRaw.author);
    const [committerName, committerEmail] = getUserInfo(commitRaw.committer);

    const totals = Object.keys(commitRaw.diffStat.files).reduce( (prev, file) => {
        const { deletions, insertions } = commitRaw.diffStat.files[file];
        prev[0] += deletions;
        prev[1] += insertions;

        return prev;
    }, [0, 0]);

    const commit = {
        id: commitRaw.id,
        parentIds: commitRaw.parents,
        author: {
            names: [authorName],
            emails: [authorEmail],
        },
        committer: {
            names: [committerName],
            emails: [committerEmail],
        },
        authorDate: new Date(commitRaw.authorDate),
        commitDate: new Date(commitRaw.date),
        diffStatistics: {
            changedFileCount: commitRaw.diffStat.files.length,
            insertions: totals[0],
            deletions: totals[1],
            files: commitRaw.diffStat.files,
        },
    }

    commitMap[commit.id] = commit;
}

for (const commitTask of commitTaskList) {
    // const commitRaw = commitRawMap[commitTask.commit.id];
    const commit = commitMap[commitTask.commit.id];

    // commitRaw.parents.forEach( id => {
    //     commit.parents.push(commitMap[id]);
    // });

    const commitNode = {
        nodeTypeName: 'COMMIT',
        commit,
        isRootNode: commitTask.isRootNode,
        isLeafNode: commitTask.isLeafNode,
        implicitBranchNo: commitTask.implicitBranchNo,
        seq: commitTask.seq,

        hasMajorTag: commitTask.hasMajorTag,
        hasMinorTag: commitTask.hasMinorTag,
        isMergeCommit: commitTask.isMergeCommit,
        taskId: commitTask.taskId,
    };

    commitNodeList.push(commitNode);

    commitNodeMapByTaskId[commitTask.taskId] ??= [];
    commitNodeMapByTaskId[commitTask.taskId].push(commitNode);
}

let taskIds = Object.keys(commitNodeMapByTaskId);
taskIds.sort( (a, b) => a - b);

for (const taskId of taskIds) {
    const clusterNode = {
        nodeTypeName: 'CLUSTER',
        commitNodeList: commitNodeMapByTaskId[taskId],
    }

    if (clusterNode.commitNodeList.slice(-1)[0].implicitBranchNo === 0)
        clusterNodeList.push(clusterNode);
}


// for (const node of clusterNodeList) {
//     const n = node.commitNodeList[0];
//     console.log(n.taskId, node.commitNodeList.length);
// }



console.log(JSON.stringify(clusterNodeList.slice(-100), null, 2));