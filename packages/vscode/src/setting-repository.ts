import * as vscode from "vscode";

const SETTING_PROPERTY_NAMES = {
  GITHUB_TOKEN: "githru.github.token",
  THEME: "githru.theme",
};

export const getGithubToken = async (secrets: vscode.SecretStorage) => {
  return await secrets.get(SETTING_PROPERTY_NAMES.GITHUB_TOKEN);
};

export const setGithubToken = async (secrets: vscode.SecretStorage, newGithubToken: string) => {
  return await secrets.store(SETTING_PROPERTY_NAMES.GITHUB_TOKEN, newGithubToken);
};

export const deleteGithubToken = async (secrets: vscode.SecretStorage) => {
  return await secrets.delete(SETTING_PROPERTY_NAMES.GITHUB_TOKEN);
};

export const setTheme = (newTheme: string) => {
  const configuration = vscode.workspace.getConfiguration();
  configuration.update(SETTING_PROPERTY_NAMES.THEME, newTheme);
};

export const getTheme = () => {
  const configuration = vscode.workspace.getConfiguration();
  const theme = configuration.get(SETTING_PROPERTY_NAMES.THEME) as string;

  if (!theme) {
    setTheme("githru");
    return "githru";
  }
  return theme;
};
