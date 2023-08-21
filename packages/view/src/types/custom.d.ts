interface Window {
  acquireVsCodeApi: () => unknown;
  githruNodesData: unknown;
  githruBranchesData: unknown;
  isProduction: boolean;
  primaryColor: string;
}

declare module "*.svg" {
  const content: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export default content;
}
