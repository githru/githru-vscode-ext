import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import url from "@rollup/plugin-url";
import json from "@rollup/plugin-json";
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';
import pkg from "./package.json";

dotenv.config();

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: "es",
      exports: "named",
      sourcemap: true,
    },
  ],
  plugins: [
    external(),
    json(),
    url({ exclude: ["**/*.svg"] }),
    resolve({ preferBuiltins: false }),
    typescript(),
    commonjs({ extensions: [".js", ".ts"] }),
    replace({
      preventAssignment: true,
      values: {
        'process.env.GEMENI_API_KEY': JSON.stringify(process.env.GEMENI_API_KEY),
      }
    })
  ],
};
