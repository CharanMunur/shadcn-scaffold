import commandExists from "command-exists";

export type PackageManager = "npm" | "pnpm" | "bun";

export function detectPackageManager(): PackageManager {
  if (commandExists.sync("bun")) {
    return "bun";
  }

  if (commandExists.sync("pnpm")) {
    return "pnpm";
  }

  return "npm";
}
