import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 파일 위치 기준 dirname 조회
export function getDirname(metaUrl?: string): string {
  // CJS일 떄
  if (typeof __dirname === "string") return __dirname as unknown as string;

  // ESM일 때
  if (metaUrl) {
    try {
      return path.dirname(fileURLToPath(metaUrl));
    } catch {}
  }
  return process.cwd();
}

// 패키지 루트 탐색
export function findPackageRoot(startDir: string): string {
  let dir = startDir;
  while (true) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return startDir;
    dir = parent;
  }
}

// 디렉토리 탐색 옵션
type ResolveDirOpts = {
  /** 최우선 ENV 이름 (예: GITHRU_LOCALES_DIR / GITHRU_TEMPLATES_DIR) */
  envVar?: string;
  /** 호출 파일의 위치(ESM일 때) */
  callerMetaUrl?: string;
  /** 호출 파일의 위치(CJS일 때) */
  callerDirname?: string;
  /** 패키지 루트(없으면 callerDirname에서 자동 탐색) */
  packageRoot?: string;
  /** 모듈(현재 파일) 기준 상대경로: ["resources/locales"] */
  moduleAnchors?: string[];
  /** 패키지 루트 기준 상대경로: ["dist/resources/locales", "resources/locales", "src/resources/locales"] */
  packageAnchors?: string[];
  /** 존재 확인용 필수 파일: ["en.json"] */
  requiredFiles: string[];
  // require.resolve로 위치 역추적 옵션
  tryRequireResolve?: { request: string; bases?: string[] };
  /** 디버그 로그 토글 ENV */
  debugEnvVar?: string;
};

// 디렉토리 위치 탐색
export function resolveAssetDir(opts: ResolveDirOpts): string {
  const {
    envVar,
    callerMetaUrl,
    callerDirname = getDirname(),
    packageRoot = findPackageRoot(callerDirname),
    moduleAnchors = [],
    packageAnchors = [],
    requiredFiles,
    tryRequireResolve,
    debugEnvVar,
  } = opts;

  const debug = debugEnvVar && process.env[debugEnvVar] === "1";

  // 0) ENV 최우선
  const envDir = envVar ? process.env[envVar]?.trim() : undefined;

  // 1) require.resolve(CJS) 역추적
  let resolvedByRequire: string | undefined;
  if (tryRequireResolve?.request) {
    try {
      const bases = tryRequireResolve.bases ?? [callerDirname, packageRoot, process.cwd()];
      for (const b of bases) {
        const p = require.resolve(tryRequireResolve.request, { paths: [b] as any });
        resolvedByRequire = path.dirname(p);
        break;
      }
    } catch {}
  }

  // 2) 모듈 기준 후보
  const moduleCandidates = moduleAnchors.map((a) => path.resolve(callerDirname, a));
  // 3) 패키지 루트 기준 후보
  const pkgCandidates = packageAnchors.map((a) => path.resolve(packageRoot, a));

  const candidates = [envDir, resolvedByRequire, ...moduleCandidates, ...pkgCandidates].filter(Boolean) as string[];

  for (const dir of candidates) {
    const ok = requiredFiles.some((f) => fs.existsSync(path.join(dir, f)));
    if (ok) {
      if (debug) console.error(`[asset] resolved: ${dir}`);
      return dir;
    }
  }

  throw new Error("Cannot locate asset directory. Tried:\n" + candidates.map((p) => ` - ${p}`).join("\n"));
}

// 파일 접근 함수 생성
export function makeAssetResolver(baseDir: string) {
  return {
    baseDir,
    path: (...parts: string[]) => path.join(baseDir, ...parts),
    readText: (file: string, enc: BufferEncoding = "utf8") => fs.readFileSync(path.join(baseDir, file), enc),
    exists: (file: string) => fs.existsSync(path.join(baseDir, file)),
  };
}
