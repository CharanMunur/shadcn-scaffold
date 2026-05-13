# shadcn-scaffold

Scaffold Vite + React + shadcn/ui apps from the terminal.

## Install

Install globally:

```bash
npm install -g shadcn-scaffold
```

Or use Bun:

```bash
bun add -g shadcn-scaffold
```

Run it without a global install:

```bash
npx shadcn-scaffold my-app
bunx shadcn-scaffold my-app
```

## Usage

Create a new app:

```bash
scaffold my-app
```

The CLI will:

- create a Vite React app
- configure Tailwind CSS
- initialize shadcn/ui
- add the `button` component
- set up a theme provider and theme toggle
- let you optionally install extra packages

## Development

Install dependencies:

```bash
bun install
```

Run the CLI locally:

```bash
bun run dev -- my-app
```

Build the publishable output:

```bash
bun run build
```

## Publish

This package publishes a `scaffold` command, even though the npm package name is `shadcn-scaffold`.

```json
{
  "bin": {
    "scaffold": "./dist/index.js"
  }
}
```
