// index.prod.tsx is for production build.
import "reflect-metadata";
import { diContainer } from "container";
import VSCodeIDEAdapter from "ide/VSCodeIDEAdapter";
import type IDEPort from "ide/IDEPort";
import { SERVICE_TOKENS } from "container/tokens";

import { initRender } from "./index.common";

diContainer.bind<IDEPort>(SERVICE_TOKENS.IDEAdapter).to(VSCodeIDEAdapter);

initRender();
