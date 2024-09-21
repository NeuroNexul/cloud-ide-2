# Next Turbo Express Starter

## Using This Template

To get started, `fork` this template repository.

## What's Inside?

This Turborepo includes the following apps and packages:

### Apps

- **`api`**: Express server built with TypeScript.
- **`web`**: A [Next.js](https://nextjs.org/) app featuring [Tailwind CSS](https://tailwindcss.com/) and [Shadcn UI](https://ui.shadcn.com/).

### Packages

- **`ui`**: A shared React component library that uses Tailwind CSS and Shadcn UI, available to both `web` and `api`.
- **`tailwind-config`**: Centralized `tailwind.config.ts` for the monorepo.
- **`eslint-config-custom`**: Custom ESLint configurations, including `eslint-config-next` and `eslint-config-prettier`.
- **`tsconfig`**: Shared TypeScript configuration files.

All packages and apps are built with [TypeScript](https://www.typescriptlang.org/).

## Building the UI Package

This setup compiles `packages/ui` and outputs the transpiled source and styles to `dist/`. This ensures efficient sharing of the Tailwind CSS configuration and generation of used styles.

