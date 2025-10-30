import "reflect-metadata";

import { Container } from "inversify";

import PluginOctokit from "./pluginOctokit";

export const diContainer = new Container();
diContainer.bind(PluginOctokit).toSelf().inSingletonScope();
