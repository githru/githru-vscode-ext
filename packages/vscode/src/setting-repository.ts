import * as vscode from "vscode";

const SETTING_PROPERTY_NAMES = {
    GITHUB_TOKEN: 'githru.github.token',
    PRIMARY_COLOR: 'githru.color.primary',
}

export const getGitHubToken = () => {

    const configuration = vscode.workspace.getConfiguration();
    const githubToken = configuration.get(SETTING_PROPERTY_NAMES.GITHUB_TOKEN);

    return githubToken;
}

export const setPrimaryColor = (color : string) => {
    const configuration = vscode.workspace.getConfiguration();
    configuration.update(SETTING_PROPERTY_NAMES.PRIMARY_COLOR, color);
}

export const getPrimaryColor = () => {
    const configuration = vscode.workspace.getConfiguration();
    const primaryColor = configuration.get(SETTING_PROPERTY_NAMES.PRIMARY_COLOR);

    if(primaryColor === null) {
        configuration.update(SETTING_PROPERTY_NAMES.PRIMARY_COLOR, "#ff8272");
    }

    return primaryColor;
}