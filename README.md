<h1 align="center">CLOUD IDE 🌥️</h1>

Cloud-IDE is an web-based Integrated Development Environment (IDE) that empowers developers to code, debug, and collaborate in real-time directly from their browser. Its lightweight design ensures high performance, while its cloud-based nature eliminates the need for local installations, allowing users to work from anywhere.

![Screen Shot](./ss/Screenshot%202024-09-22%20034357.png)

## Techstack

- Terborepo (Monorepo)
- NextJS (UI)
- ShadCN UI (Components Library)
- Express JS (Backend)

## Setup Locally

- **Step 1:** Fork & Clone the Repository into your local machine.
- **Step 2:** Install all the dependencies.
  ```bash
  pnpm install
  ```
- **Step 3:** Make sure all the `.env.example` file in all workspace (If Exists) be converted into `.env` and the values are added properly.
- **Step 4:** Run the code.
  ```bash
  pnpm dev
  ```

> **Note:** Make sure that `node-pty` package is added properly. If not then search it on google.

## Folder Structure

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

