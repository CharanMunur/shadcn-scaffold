import ora from "ora";
import { execa } from "execa";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import {
  appTsxCode,
  indexCss,
  mainTsxCode,
  modeToggleCode,
  themeProviderCode,
  viteConfig,
} from "./templates";

export async function create(projectName: string, packages: string[]) {
  const spinner = ora("Scaffolding Vite React app...").start();

  try {
    await execa("bun", [
      "create",
      "vite@latest",
      projectName,
      "--template",
      "react-ts",
    ]);
    spinner.succeed("Vite React app created");

    spinner.start("Installing Tailwind CSS...");
    await execa("bun", ["add", "tailwindcss", "@tailwindcss/vite"], {
      cwd: projectName,
    });
    spinner.succeed("Tailwind CSS installed");

    spinner.start("Configuring Tailwind CSS...");
    fs.writeFileSync(path.join(projectName, "vite.config.ts"), viteConfig);
    fs.writeFileSync(path.join(projectName, "src", "index.css"), indexCss);
    fs.unlinkSync(path.join(projectName, "src", "App.css"));
    spinner.succeed("Tailwind CSS configured");

    const tsconfigAppPath = path.join(projectName, "tsconfig.app.json");
    let tsconfigAppContent = fs.readFileSync(tsconfigAppPath, "utf-8");
    tsconfigAppContent = tsconfigAppContent.replace(
      '"compilerOptions": {',
      `"compilerOptions": {\n    "ignoreDeprecations": "6.0",\n    "baseUrl": ".",\n    "paths": {\n      "@/*": [\n        "./src/*"\n      ]\n    },`,
    );
    fs.writeFileSync(tsconfigAppPath, tsconfigAppContent);

    const tsconfigPath = path.join(projectName, "tsconfig.json");
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));
    tsconfig.compilerOptions = {
      baseUrl: ".",
      ignoreDeprecations: "6.0",
      paths: {
        "@/*": ["./src/*"],
      },
    };
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));

    spinner.start("Initializing shadcn/ui...");
    await execa("bunx", [
      "--bun",
      "shadcn@latest",
      "init",
      "-t",
      "vite",
      "-d",
      "-y",
      "--cwd",
      projectName,
    ]);
    spinner.succeed("shadcn/ui initialized");

    spinner.start("Adding shadcn button component...");
    await execa("bunx", [
      "--bun",
      "shadcn@latest",
      "add",
      "button",
      "-y",
      "--cwd",
      projectName,
    ]);
    spinner.succeed("shadcn button added");

    spinner.start("Setting up custom project structure and theme toggle...");
    fs.mkdirSync(path.join(projectName, "src", "providers"), {
      recursive: true,
    });
    fs.mkdirSync(path.join(projectName, "src", "features", "theme"), {
      recursive: true,
    });

    fs.writeFileSync(
      path.join(projectName, "src", "providers", "theme-provider.tsx"),
      themeProviderCode,
    );
    fs.writeFileSync(
      path.join(projectName, "src", "features", "theme", "mode-toggle.tsx"),
      modeToggleCode,
    );
    fs.writeFileSync(path.join(projectName, "src", "main.tsx"), mainTsxCode);
    fs.writeFileSync(path.join(projectName, "src", "App.tsx"), appTsxCode);
    spinner.succeed("Project structure and theme configured");

    if (packages.length > 0) {
      spinner.start(`Installing extra packages: ${packages.join(", ")}...`);
      await execa("bun", ["add", ...packages], {
        cwd: projectName,
      });
      spinner.succeed("Extra packages installed");
    }

    console.log(
      `\n${chalk.green("✔")} Successfully created ${chalk.cyan(projectName)}!`,
    );
    console.log(`\nNext steps:`);
    console.log(`  ${chalk.cyan(`cd ${projectName}`)}`);
    console.log(`  ${chalk.cyan("bun run dev")}\n`);
  } catch (error) {
    spinner.fail("An error occurred during setup");
    console.error(error);
    throw error;
  }
}
