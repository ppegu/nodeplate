import fs from "fs";
import { load as defaultLoad, resolve as defaultResolve } from "ts-node/esm";
import { fileURLToPath } from "url";

const extensions = [".ts", "/index.ts", ".js", ".mjs"];

export async function resolve(
  specifier,
  context,
  defaultResolveFn = defaultResolve
) {
  const { parentURL } = context;

  if (specifier.startsWith(".")) {
    const basePath = fileURLToPath(new URL(specifier, parentURL));
    for (const ext of extensions) {
      try {
        fs.accessSync(basePath + ext);
        return defaultResolveFn(specifier + ext, context, defaultResolveFn);
      } catch {
        // continue to the next extension
      }
    }
  }

  return defaultResolve(specifier, context, defaultResolveFn);
}

export async function load(url, context, defaultLoadFn = defaultLoad) {
  try {
    const result = await defaultLoad(url, context, defaultLoadFn);
    return result;
  } catch (err) {
    console.error("\x1b[31m%s\x1b[0m", "Error:", err);
    process.exit(1);
  }
}
