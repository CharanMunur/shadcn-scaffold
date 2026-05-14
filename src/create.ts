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
} from "./templates.js";
import { detectPackageManager } from "./packageDetector.js";

export async function create(projectName: string, packages: string[]) {
  const spinner = ora("Scaffolding Vite React app...").start();
  const pm = detectPackageManager();
  const installCmd = pm === "npm" ? "install" : "add";
  const executeCmd = pm === "bun" ? "bunx" : pm === "pnpm" ? "pnpm" : "npx";
  const executeArgs =
    pm === "bun"
      ? ["--bun", "shadcn@latest"]
      : pm === "pnpm"
        ? ["dlx", "shadcn@latest"]
        : ["shadcn@latest"];

  try {
    await execa(pm, [
      "create",
      "vite@latest",
      projectName,
      "--template",
      "react-ts",
    ]);
    spinner.succeed("Vite React app created");

    spinner.start("Installing Tailwind CSS...");
    await execa(pm, [installCmd, "tailwindcss", "@tailwindcss/vite"], {
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
    // Strip out ignoreDeprecations from Vite's default template to avoid IDE errors
    tsconfigAppContent = tsconfigAppContent.replace(/"ignoreDeprecations":\s*"[^"]*",?/g, "");
    tsconfigAppContent = tsconfigAppContent.replace(
      '"compilerOptions": {',
      `"compilerOptions": {\n    "baseUrl": ".",\n    "paths": {\n      "@/*": [\n        "./src/*"\n      ]\n    },`,
    );
    fs.writeFileSync(tsconfigAppPath, tsconfigAppContent);

    const tsconfigPath = path.join(projectName, "tsconfig.json");
    let tsconfigContent = fs.readFileSync(tsconfigPath, "utf-8");
    tsconfigContent = tsconfigContent.replace(/"ignoreDeprecations":\s*"[^"]*",?/g, "");
    const tsconfig = JSON.parse(tsconfigContent);
    tsconfig.compilerOptions = {
      ...tsconfig.compilerOptions,
      baseUrl: ".",
      paths: {
        "@/*": ["./src/*"],
      },
    };
    // Ensure ignoreDeprecations is definitely removed
    delete tsconfig.compilerOptions.ignoreDeprecations;
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));

    spinner.start("Initializing shadcn/ui...");
    await execa(executeCmd, [
      ...executeArgs,
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
    await execa(executeCmd, [
      ...executeArgs,
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
      await execa(pm, [installCmd, ...packages], {
        cwd: projectName,
      });
      spinner.succeed("Extra packages installed");
    }

    console.log(
      `\n${chalk.green("✔")} Successfully created ${chalk.cyan(projectName)}!`,
    );
    console.log(`\nNext steps:`);
    console.log(`  ${chalk.cyan(`cd ${projectName}`)}`);
    console.log(`  ${chalk.cyan(`${pm} run dev`)}\n`);
  } catch (error: any) {
    spinner.fail("An error occurred during setup");
    
    if (error.stderr) {
      console.error(chalk.red("\nDetailed Error (stderr):"));
      console.error(chalk.dim(error.stderr));
    } else if (error.message) {
      console.error(chalk.red("\nError Message:"));
      console.error(chalk.dim(error.message));
    } else {
      console.error(chalk.red("\nUnknown Error:"));
      console.error(error);
    }
    
    process.exit(1);
  }
}
