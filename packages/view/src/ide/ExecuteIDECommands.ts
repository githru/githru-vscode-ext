export type IDEMessage = {
  command: string;
  uri: string;
};

export default interface ExecuteIDECommandsRepository {
  openDocument: (uri: string) => void;
  // openDocumentWithDiffEditor: (uri: string) => void;
}
