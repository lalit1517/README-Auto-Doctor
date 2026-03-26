# readme-auto-doctor
## Description
A Next.js application designed for markdown processing, syntax highlighting, and diff visualization. It integrates TypeScript, Tailwind CSS, and NextAuth.js, enabling the rendering of GitHub Flavored Markdown and the visualization of differences between documents.

## Features
*   Next.js 14 with App Router
*   TypeScript support
*   Tailwind CSS styling
*   NextAuth.js authentication
*   Markdown rendering with GitHub Flavored Markdown support
*   Syntax highlighting for code blocks
*   Diff visualization between documents

## Installation
```bash
npm install
```

## Usage
```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Tech Stack
*   **Framework**: Next.js 14
*   **Frontend**: React 18
*   **Runtime**: Node.js
*   **Language**: TypeScript 5.7
*   **Styling**: Tailwind CSS 3, PostCSS
*   **Authentication**: NextAuth.js 4
*   **Markdown Processing**: `react-markdown`, `remark-gfm`, `rehype-highlight`
*   **Diff Visualization**: `react-diff-viewer-continued`

## Folder Structure
*   `.gitignore`: Specifies files and directories to be ignored by Git.
*   `app/`: Contains the main application code following the Next.js App Router structure.
*   `components/`: Stores reusable UI components.
*   `lib/`: Holds utility functions and helper modules.
*   `next-env.d.ts`: Declares types specific to the Next.js environment for TypeScript.
*   `next.config.mjs`: Next.js configuration file.
*   `package-lock.json`: Records the exact dependency tree.
*   `package.json`: Defines project metadata, scripts, and dependencies.
*   `postcss.config.js`: PostCSS configuration file.
*   `tailwind.config.ts`: Tailwind CSS configuration file.
*   `tsconfig.json`: TypeScript compiler configuration file.
*   `types/`: Contains custom TypeScript type definitions.

## Architecture Overview
*   **Purpose**: A Next.js application for markdown processing, syntax highlighting, and diff visualization.
*   **Core Functionality**: Renders GitHub Flavored Markdown, provides syntax highlighting, and visualizes document differences.
*   **Authentication**: Integrates NextAuth.js.
*   **Architecture**: Built with Next.js 14 App Router, utilizing a modern `/app` directory structure and TypeScript.
*   **Key Technologies**: Leverages React 18, Tailwind CSS, `react-markdown`, `rehype-highlight`, and `react-diff-viewer-continued`.