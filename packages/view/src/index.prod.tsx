// index.prod.tsx is for production build.
import "reflect-metadata";
import { container } from "container";
import VSCodeIDEAdapter from "ide/VSCodeIDEAdapter";
import type IDEPort from "ide/IDEPort";
import { SERVICE_TOKENS } from "container/tokens";

import { initRender } from "./index.common";

container.bind<IDEPort>(SERVICE_TOKENS.IDEAdapter).to(VSCodeIDEAdapter);

initRender();
