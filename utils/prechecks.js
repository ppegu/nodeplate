import fs from "fs-extra";

export function checkProjectDirExists(projectDir, projectName) {
  if (fs.existsSync(projectDir)) {
    console.error(
      `Directory ${projectName} already exists. Please choose a different name.`
    );
    process.exit(1);
  }
}

export async function prechecks({ projectDir, projectName }) {
  checkProjectDirExists(projectDir, projectName);
}
