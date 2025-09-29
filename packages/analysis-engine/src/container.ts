import "reflect-metadata";

import { Container } from "inversify";

import PluginOctokit from "./pluginOctokit";

export const container = new Container();
container.bind(PluginOctokit).toSelf().inSingletonScope();
