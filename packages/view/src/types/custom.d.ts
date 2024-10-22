interface Window {
  acquireVsCodeApi: () => unknown;
  githruNodesData: unknown;
  githruBranchesData: unknown;
  isProduction: boolean;
  theme: string;
}

declare module "*.svg" {
  import type { ReactElement, SVGProps } from "react";

  const content: (props: SVGProps<SVGElement>) => ReactElement;
  export default content;
}
