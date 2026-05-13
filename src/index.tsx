import { Command } from "commander";
import { App } from "./ui.js";
import { render } from "ink";

const program = new Command();

program
  .name("superman")
  .description("Sets up your personal React stack instantly")
  .version("1.0.0")
  .argument("<project-name>", "Name of your project")
  .action((projectName) => {
    render(<App projectName={projectName} />);
  });

program.parse();
