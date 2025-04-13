import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export function updatePackageName(projectDir, appName) {
  const packageJsonPath = path.join(projectDir, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    packageJson.name = appName;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
}

export function createNvmrcFile(projectDir) {
  try {
    const nvmVersion = execSync("nvm --version", { stdio: "pipe" })
      .toString()
      .trim();
    if (nvmVersion) {
      const nodeVersion = execSync("nvm current", { stdio: "pipe" })
        .toString()
        .trim();
      const nvmrcPath = path.join(projectDir, ".nvmrc");
      fs.writeFileSync(nvmrcPath, nodeVersion);
      console.log(`.nvmrc file created with Node.js version: ${nodeVersion}`);
    }
  } catch (error) {
    console.warn(
      "nvm is not available on this system. Skipping .nvmrc creation."
    );
  }
}
