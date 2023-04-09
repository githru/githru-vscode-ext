// index.prod.tsx is for production build.
import "reflect-metadata";
import { container } from "tsyringe";

import VSCodeIDEAdapter from "ide/VSCodeIDEAdapter";

import type IDEPort from "./ide/IDEPort";
import { initRender } from "./index.common";

container.register<IDEPort>("IDEAdapter", { useClass: VSCodeIDEAdapter });

initRender();
