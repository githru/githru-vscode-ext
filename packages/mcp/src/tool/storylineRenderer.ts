import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { generateNewViz } from '../tool/generateNewViz.js';
import ServerSideFolderActivityFlow from '../component/FolderActivityFlow/ServerSideFolderActivityFlow.js';
import { analyzeReleaseBasedFolders, extractReleaseBasedContributorActivities, generateReleaseFlowLineData, findFirstReleaseContributorNodes } from '../component/FolderActivityFlow/FolderActivityFlow.util.js';
// @ts-ignore
import sharp from 'sharp';
import { Config } from "../common/config.js";

interface StorylineInputs {
  repo: string;
  baseBranchName?: string;
  locale?: string;
}

export async function renderStorylineUI(inputs: StorylineInputs): Promise<{ type: 'image'; data: string; mimeType: string; annotations?: any } | { type: 'text'; data: string }> {
  try {
    const config = Config.getInstance();
    const githubToken = config.getGithubToken();

    const totalData = await generateNewViz({
      repo: inputs.repo,
      githubToken: githubToken,
      baseBranchName: inputs.baseBranchName,
    });


    if (!totalData || Object.keys(totalData).length === 0) {
      return {
        type: 'text',
        data: '<div style="padding:20px;border:1px solid #orange;border-radius:8px">No data available for storyline visualization</div>'
      };
    }

    const commitDataList: any[] = [];

    if (totalData && typeof totalData === 'object' && !Array.isArray(totalData)) {
      Object.values(totalData).forEach((csmNodes: any) => {
        if (Array.isArray(csmNodes)) {
          csmNodes.forEach((csmNode: any) => {
            if (csmNode && csmNode.base && csmNode.base.commit) {
              const commitRaw = csmNode.base.commit;
              commitDataList.push({
                id: commitRaw.id,
                authorDate: commitRaw.authorDate.toISOString(),
                commitDate: commitRaw.committerDate.toISOString(),
                author: {
                  id: commitRaw.author.name,
                  names: [commitRaw.author.name],
                  emails: [commitRaw.author.email],
                },
                committer: {
                  id: commitRaw.committer.name,
                  names: [commitRaw.committer.name],
                  emails: [commitRaw.committer.email],
                },
                message: commitRaw.message,
                releaseTags: commitRaw.tags || [],
                tags: commitRaw.tags || [],
                diffStatistics: {
                  changedFileCount: Object.keys(commitRaw.differenceStatistic.fileDictionary).length,
                  insertions: commitRaw.differenceStatistic.totalInsertionCount,
                  deletions: commitRaw.differenceStatistic.totalDeletionCount,
                  files: commitRaw.differenceStatistic.fileDictionary,
                },
              });
            }
            if (csmNode && csmNode.source && Array.isArray(csmNode.source)) {
              csmNode.source.forEach((sourceNode: any) => {
                if (sourceNode && sourceNode.commit) {
                  const commitRaw = sourceNode.commit;
                  commitDataList.push({
                    id: commitRaw.id,
                    authorDate: commitRaw.authorDate.toISOString(),
                    commitDate: commitRaw.committerDate.toISOString(),
                    author: {
                      id: commitRaw.author.name,
                      names: [commitRaw.author.name],
                      emails: [commitRaw.author.email],
                    },
                    committer: {
                      id: commitRaw.committer.name,
                      names: [commitRaw.committer.name],
                      emails: [commitRaw.committer.email],
                    },
                    message: commitRaw.message,
                    releaseTags: commitRaw.tags || [],
                    tags: commitRaw.tags || [],
                    diffStatistics: {
                      changedFileCount: Object.keys(commitRaw.differenceStatistic.fileDictionary).length,
                      insertions: commitRaw.differenceStatistic.totalInsertionCount,
                      deletions: commitRaw.differenceStatistic.totalDeletionCount,
                      files: commitRaw.differenceStatistic.fileDictionary,
                    },
                  });
                }
              });
            }
          });
        }
      });
    } else if (Array.isArray(totalData)) {
      commitDataList.push(...totalData);
    } else {
      throw new Error('Invalid data format: expected CSMDictionary or array');
    }

    const clusterNodes = commitDataList.map((commitData, index) => ({
      nodeTypeName: 'CLUSTER' as any,
      commitNodeList: [{
        nodeTypeName: 'COMMIT' as any,
        commit: {
          sequence: index,
          id: commitData.id,
          parents: [],
          branches: [],
          tags: commitData.tags || [],
          author: {
            name: commitData.author.names[0] || commitData.author.id,
            email: commitData.author.emails[0] || ''
          },
          authorDate: new Date(commitData.authorDate),
          committer: {
            name: commitData.committer.names[0] || commitData.committer.id,
            email: commitData.committer.emails[0] || ''
          },
          committerDate: new Date(commitData.commitDate),
          message: commitData.message,
          differenceStatistic: {
            totalInsertionCount: commitData.diffStatistics.insertions,
            totalDeletionCount: commitData.diffStatistics.deletions,
            fileDictionary: commitData.diffStatistics.files
          },
          commitMessageType: ''
        },
        seq: index,
        clusterId: index
      }]
    }));

    const releaseResult = analyzeReleaseBasedFolders(clusterNodes, 8, 1);
    const { releaseGroups, topFolderPaths: releaseTopFolderPaths } = releaseResult;
    
    const releaseContributorActivities = extractReleaseBasedContributorActivities(clusterNodes, releaseTopFolderPaths, 1);
    const flowLineData = generateReleaseFlowLineData(releaseContributorActivities);
    const firstNodesByContributor = findFirstReleaseContributorNodes(releaseContributorActivities);

    const htmlString = ReactDOMServer.renderToString(
      React.createElement(ServerSideFolderActivityFlow, {
        releaseGroups,
        releaseTopFolderPaths: releaseTopFolderPaths,
        releaseContributorActivities,
        flowLineData,
        firstNodesByContributor,
      })
    );

    const svgMatch = htmlString.match(/<svg[^>]*>[\s\S]*<\/svg>/);
    if (!svgMatch) {
      throw new Error('SVG not found in rendered HTML');
    }

        const svgString = svgMatch[0];
        
    const pngBuffer = await sharp(Buffer.from(svgString))
      .png()
      .toBuffer();
        
    return {
      type: 'image',
      data: pngBuffer.toString('base64'),
      mimeType: 'image/png',
      annotations: {
        audience: ['user'],
        priority: 0.9
      }
    };

  } catch (error: any) {
    console.error('Error in renderStorylineUI:', error);
    return {
      type: 'text',
      data: `<div style="padding:20px;border:1px solid #red;border-radius:8px;background-color:#ffe6e6"><h3>Error in Storyline UI</h3><p>Error: ${error.message}</p><details><summary>Show technical details</summary><pre>${error.stack}</pre></details></div>`
    };
  }
}