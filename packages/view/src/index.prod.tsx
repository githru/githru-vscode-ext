// index.prod.tsx is for production build.
import "reflect-metadata";
import { diContainer } from "container";
import VSCodeIDEAdapter from "ide/VSCodeIDEAdapter";
import type IDEPort from "ide/IDEPort";
import { DI_IDENTIFIERS } from "container/identifiers";

import { initRender } from "./index.common";

diContainer.bind<IDEPort>(DI_IDENTIFIERS.IDEAdapter).to(VSCodeIDEAdapter);

initRender();
