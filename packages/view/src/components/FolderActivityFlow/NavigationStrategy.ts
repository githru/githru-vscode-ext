import type { ClusterNode } from "types";

import type { FolderActivity } from "./FolderActivityFlow.analyzer";
import type { ReleaseGroup } from "./FolderActivityFlow.releaseAnalyzer";
import { analyzeReleaseBasedFolders } from "./FolderActivityFlow.util";
import { getReleaseSubFolders } from "./FolderActivityFlow.subfolder";

/**
 * Strategy interface for mode-specific navigation behavior
 */
export interface NavigationStrategy {
  /**
   * Get subfolders for the given path
   */
  getSubFolders(totalData: ClusterNode[], path: string): FolderActivity[] | string[];

  /**
   * Get root level folders
   */
  getRootFolders(totalData: ClusterNode[]): {
    folders: FolderActivity[] | string[];
    releaseGroups?: ReleaseGroup[];
  };
}

/**
 * Release mode navigation strategy
 */
export class ReleaseModeStrategy implements NavigationStrategy {
  getSubFolders(totalData: ClusterNode[], path: string): string[] {
    return getReleaseSubFolders(totalData, path);
  }

  getRootFolders(totalData: ClusterNode[]): {
    folders: string[];
    releaseGroups: ReleaseGroup[];
  } {
    const flatData = totalData.flat();
    const releaseResult = analyzeReleaseBasedFolders(flatData, 8, 1);
    return {
      folders: releaseResult.topFolderPaths,
      releaseGroups: releaseResult.releaseGroups,
    };
  }
}
