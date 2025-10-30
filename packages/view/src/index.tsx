// THIS index.tsx is only for development (CRA npm start)
import "reflect-metadata";
import { diContainer } from "container";
import FakeIDEAdapter from "ide/FakeIDEAdapter";
import type IDEPort from "ide/IDEPort";
import { DI_IDENTIFIERS } from "container/identifiers";

import { initRender } from "./index.common";

diContainer.bind<IDEPort>(DI_IDENTIFIERS.IDEAdapter).to(FakeIDEAdapter).inSingletonScope();

initRender();
