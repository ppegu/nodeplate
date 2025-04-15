#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import ora from "ora";
import { updatePackageName, createNvmrcFile } from "./utils/fileUtils.js";
import { checkProjectDirExists } from "./utils/prechecks.js";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getUserInputs(templates) {
  const { template } = await inquirer.prompt([
    {
      type: "list",
      name: "template",
      message: "Select a template to use:",
      choices: templates
    }
  ]);

  const { projectName } = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter the name of your project:",
      validate: (input) =>
        input.trim() !== "" || "Project name cannot be empty."
    }
  ]);

  return { template, projectName };
}

async function main() {
  console.log("Welcome to create-my-node-app!");

  const templatesDir = path.resolve(__dirname, "templates");
  const templates = fs
    .readdirSync(templatesDir)
    .filter((file) => fs.statSync(path.join(templatesDir, file)).isDirectory());

  if (templates.length === 0) {
    console.error("No templates found in the templates directory.");
    process.exit(1);
  }

  const { template, projectName } = await getUserInputs(templates);

  const projectDir = path.resolve(process.cwd(), projectName);

  await prechecks({
    projectDir,
    projectName
  });

  const spinner = ora("Creating project folder...").start();
  fs.mkdirSync(projectDir);
  spinner.succeed("Project folder created.");

  spinner.start("Copying template files...");

  fs.copySync(path.join(templatesDir, template), projectDir, {
    filter: (src) => {
      const baseName = path.basename(src);
      if (baseName === "node_modules") return false;
      return true;
    }
  });

  // Ensure .gitignore is copied
  const gitignorePath = path.join(templatesDir, template, ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    fs.copySync(gitignorePath, path.join(projectDir, ".gitignore"));
  } else {
    console.log(
      "Warning: .gitignore file not found in template. Please create one manually."
    );
  }

  spinner.succeed("Template files copied.");

  updatePackageName(projectDir, projectName);

  createNvmrcFile(projectDir);

  const { initializeGit, installDependencies } = await inquirer.prompt([
    {
      type: "confirm",
      name: "initializeGit",
      message: "Initialize a git repository?",
      default: true
    },
    {
      type: "confirm",
      name: "installDependencies",
      message: "Run npm install?",
      default: true
    }
  ]);

  if (initializeGit) {
    spinner.start("Initializing git repository...");
    execSync("git init", { cwd: projectDir, stdio: "ignore" });
    spinner.succeed("Git repository initialized.");
  }

  if (installDependencies) {
    spinner.start("Installing dependencies...");
    execSync("npm install", { cwd: projectDir, stdio: "ignore" });
    spinner.succeed("Dependencies installed.");
  }

  console.log("🎉 Project setup complete! Your app is ready in", projectName);
}

main().catch((err) => {
  console.error("An error occurred:", err);
  process.exit(1);
});

export default main;
