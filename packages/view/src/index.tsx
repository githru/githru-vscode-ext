// THIS index.tsx is only for development (CRA npm start)
import "reflect-metadata";
import { container } from "./container";
import FakeIDEAdapter from "./ide/FakeIDEAdapter";
import type IDEPort from "./ide/IDEPort";
import { initRender } from "./index.common";

container.bind<IDEPort>("IDEAdapter").to(FakeIDEAdapter);

initRender();
