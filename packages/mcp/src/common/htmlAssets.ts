import { resolveAssetDir, makeAssetResolver, getDirname } from "./assetResolver.js";

// HTML 템플릿 디렉토리 위치 탐색
const TEMPLATES_DIR = resolveAssetDir({
  envVar: "GITHRU_TEMPLATES_DIR",
  callerDirname: getDirname(),
  moduleAnchors: ["html", "../html"],
  packageAnchors: ["dist/html", "html", "src/html"],
  requiredFiles: [
    "contributors-chart.html",
    "feature-impact.html",
    "author-work-pattern.html",
    "no-contributors.html",
    "error-chart.html",
  ],
});

export const htmlAssets = makeAssetResolver(TEMPLATES_DIR);
