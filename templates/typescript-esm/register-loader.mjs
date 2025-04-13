import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./custom-loader.mjs", pathToFileURL("./"));
