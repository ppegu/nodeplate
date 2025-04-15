export async function getUserInputs(templates) {
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
