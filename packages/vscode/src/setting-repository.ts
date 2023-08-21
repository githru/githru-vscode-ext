import * as vscode from "vscode";

const SETTING_PROPERTY_NAMES = {
  GITHUB_TOKEN: "githru.github.token",
  PRIMARY_COLOR: "githru.color.primary",
};

export const getGithubToken = (): string | undefined => {
  const configuration = vscode.workspace.getConfiguration();
  return configuration.get(SETTING_PROPERTY_NAMES.GITHUB_TOKEN);
};

export const setPrimaryColor = (color: string) => {
  const configuration = vscode.workspace.getConfiguration();
  configuration.update(SETTING_PROPERTY_NAMES.PRIMARY_COLOR, color);
};

export const getPrimaryColor = (): string => {
  const configuration = vscode.workspace.getConfiguration();
  const primaryColor = configuration.get(SETTING_PROPERTY_NAMES.PRIMARY_COLOR) as string;

  if (!primaryColor) {
    configuration.update(SETTING_PROPERTY_NAMES.PRIMARY_COLOR, "#ff8272");
    return "#ff8272";
  } else {
    return primaryColor;
  }
};
