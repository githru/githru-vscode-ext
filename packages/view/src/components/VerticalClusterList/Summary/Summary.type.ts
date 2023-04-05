export type AuthorProps = {
  name: string;
  src: string;
};

export type Content = {
  message: string;
  count: number;
};

export type ContentProps = {
  content: Content;
  clusterId: number;
  selectedClusterId: number[];
};

export type Summary = {
  authorNames: Array<Array<AuthorProps["name"]>>;
  content: Content;
};

export type Cluster = {
  clusterId: number;
  summary: Summary;
};

export type SrcInfo = {
  key: string;
  value: string;
};

export type AuthSrcMap = {
  [key: string]: string;
} | null;
