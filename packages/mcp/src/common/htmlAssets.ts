import { resolveAssetDir, makeAssetResolver, getDirname } from "./assetResolver.js";

let _assets: ReturnType<typeof makeAssetResolver> | null = null;

export function getHtmlAssets() {
  if (_assets) return _assets;

  // HTML 템플릿 디렉토리 위치 탐색
  const TEMPLATES_DIR = resolveAssetDir({
    envVar: "GITHRU_TEMPLATES_DIR",
    callerDirname: getDirname(),
    callerMetaUrl: import.meta.url,
    moduleAnchors: ["html", "../html"],
    packageAnchors: ["dist/html", "html", "src/html"],
    requiredFiles: [
      "contributors-chart.html",
      "feature-impact.html",
      "author-work-pattern.html",
      "no-contributors.html",
      "error-chart.html",
    ],
    debugEnvVar: "SHOW_ASSET_LOG",
  });

  _assets = makeAssetResolver(TEMPLATES_DIR);
  return _assets;
}
