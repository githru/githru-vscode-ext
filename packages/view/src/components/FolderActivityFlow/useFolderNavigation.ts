import { useState, useCallback } from "react";

import type { ClusterNode } from "types";

import type { ReleaseGroup } from "./FolderActivityFlow.releaseAnalyzer";
import { ReleaseModeStrategy, type NavigationStrategy } from "./NavigationStrategy";

/**
 * Custom hook for managing folder navigation state and operations
 */
export function useFolderNavigation(totalData: ClusterNode[]) {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [folderDepth, setFolderDepth] = useState<number>(1);
  const [releaseGroups, setReleaseGroups] = useState<ReleaseGroup[]>([]);
  const [releaseTopFolderPaths, setReleaseTopFolderPaths] = useState<string[]>([]);

  const navigationStrategy: NavigationStrategy = new ReleaseModeStrategy();

  /**
   * Navigate to a specific folder
   */
  const navigateToFolder = useCallback(
    (folderPath: string) => {
      if (folderPath === ".") {
        return;
      }

      const subFolders = navigationStrategy.getSubFolders(totalData, folderPath);

      if (subFolders.length > 0) {
        setCurrentPath(folderPath);
        setFolderDepth((prev) => prev + 1);

        setReleaseTopFolderPaths(subFolders as string[]);
      }
    },
    [navigationStrategy, totalData]
  );

  /**
   * Navigate up to parent folder
   */
  const navigateUp = useCallback(() => {
    if (currentPath === "") {
      return;
    }

    const parentPath = currentPath.includes("/") ? currentPath.substring(0, currentPath.lastIndexOf("/")) : "";

    if (parentPath === "") {
      setCurrentPath("");
      setFolderDepth(1);

      const rootResult = navigationStrategy.getRootFolders(totalData);

      setReleaseTopFolderPaths(rootResult.folders as string[]);
      if (rootResult.releaseGroups) {
        setReleaseGroups(rootResult.releaseGroups);
      }
    } else {
      setCurrentPath(parentPath);
      setFolderDepth((prev) => Math.max(1, prev - 1));

      const subFolders = navigationStrategy.getSubFolders(totalData, parentPath);

      setReleaseTopFolderPaths(subFolders as string[]);
    }
  }, [currentPath, navigationStrategy, totalData]);

  /**
   * Navigate to breadcrumb by index
   */
  const navigateToBreadcrumb = useCallback(
    (index: number, breadcrumbsLength: number) => {
      if (index === 0) {
        setCurrentPath("");
        setFolderDepth(1);

        const rootResult = navigationStrategy.getRootFolders(totalData);

        setReleaseTopFolderPaths(rootResult.folders as string[]);
        if (rootResult.releaseGroups) {
          setReleaseGroups(rootResult.releaseGroups);
        }
      } else if (index < breadcrumbsLength - 1) {
        const pathParts = currentPath.split("/");
        const targetPath = pathParts.slice(0, index).join("/");
        setCurrentPath(targetPath);
        setFolderDepth(index + 1);

        const subFolders = navigationStrategy.getSubFolders(totalData, targetPath);

        setReleaseTopFolderPaths(subFolders as string[]);
      }
    },
    [currentPath, navigationStrategy, totalData]
  );

  /**
   * Initialize root folders for both modes
   */
  const initializeRootFolders = useCallback(() => {
    if (!totalData || totalData.length === 0 || currentPath !== "") {
      return;
    }

    const releaseStrategy = new ReleaseModeStrategy();
    const releaseResult = releaseStrategy.getRootFolders(totalData);
    setReleaseTopFolderPaths(releaseResult.folders as string[]);
    if (releaseResult.releaseGroups) {
      setReleaseGroups(releaseResult.releaseGroups);
    }
  }, [totalData, currentPath]);

  /**
   * Get breadcrumbs for current path
   */
  const getBreadcrumbs = useCallback(() => {
    if (currentPath === "") {
      return ["root"];
    }

    const parts = currentPath.split("/");
    const breadcrumbs = ["root"];
    let current = "";

    parts.forEach((part) => {
      current = current ? `${current}/${part}` : part;
      breadcrumbs.push(part);
    });

    return breadcrumbs;
  }, [currentPath]);

  return {
    // State
    currentPath,
    folderDepth,
    releaseGroups,
    releaseTopFolderPaths,

    // Actions
    navigateToFolder,
    navigateUp,
    navigateToBreadcrumb,
    initializeRootFolders,
    getBreadcrumbs,
  };
}
