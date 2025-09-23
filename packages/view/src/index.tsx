// THIS index.tsx is only for development (CRA npm start)
import "reflect-metadata";
import { container } from "container";
import FakeIDEAdapter from "ide/FakeIDEAdapter";
import type IDEPort from "ide/IDEPort";
import { SERVICE_TOKENS } from "container/tokens";

import { initRender } from "./index.common";

container.bind<IDEPort>(SERVICE_TOKENS.IDEAdapter).to(FakeIDEAdapter);

initRender();
