// THIS index.tsx is only for development (CRA npm start)

import "reflect-metadata";
import { container } from "tsyringe";

import FakeIDEAdapter from "ide/FakeIDEAdapter";
import { initRender } from "index.common";

import type IDEPort from "./ide/IDEPort";

container.register<IDEPort>("IDEPort", { useClass: FakeIDEAdapter });
console.log("isProduction = ", window.isProduction);

initRender();
