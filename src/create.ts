import Ora from "ora";
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
  await execa("bun", [
    "create",
    "vite@latest",
    projectName,
    "--template",
    "react-ts",
  ]);

  await execa("bun", ["add", "tailwindcss", "@tailwindcss/vite"], {
    cwd: projectName,
  });

  fs.writeFileSync(path.join(projectName, "vite.config.ts"), viteConfig);

  fs.writeFileSync(path.join(projectName, "src", "index.css"), indexCss);

  fs.unlinkSync(path.join(projectName, "src", "App.css"));

  await execa("bunx", [
    "--bun",
    "shadcn@latest",
    "init",
    "-t",
    "vite",
    "-y",
    "--cwd",
    projectName,
  ]);

  await execa("bunx", [
    "--bun",
    "shadcn@latest",
    "add",
    "button",
    "--cwd",
    projectName,
  ]);

  fs.mkdirSync(path.join(projectName, "src", "providers"), { recursive: true });
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

  if (packages.length > 0) {
    await execa("bun", ["add", ...packages], {
      cwd: projectName,
    });
  }
}
