import * as vscode from "vscode";

const SETTING_PROPERTY_NAMES = {
    GITHUB_TOKEN: 'githru.github.token'
}

export const getGitHubToken = () => {

    const configuration = vscode.workspace.getConfiguration();
    const githubToken = configuration.get(SETTING_PROPERTY_NAMES.GITHUB_TOKEN);

    return githubToken;
}