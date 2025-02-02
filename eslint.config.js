import { default as defaultConfig } from "@epic-web/config/eslint";
import reactCompiler from "eslint-plugin-react-compiler";

/** @type {import("eslint").Linter.Config} */
export default [
  ...defaultConfig,
  {
    plugins: {
      "react-compiler": reactCompiler,
    },
    files: ["**/tests/**/*.ts"],
    rules: {
      "react-compiler/react-compiler": "error",
    },
  },
  {
    ignores: [".react-router/*"],
  },
];
