# readme-auto-doctor

## 📖 Description  
A Next.js application with TypeScript, Tailwind CSS, and NextAuth.js integration. The project features markdown processing with syntax highlighting and diff visualization capabilities.

## ✨ Features  
- Next.js 14 with App Router  
- TypeScript support  
- Tailwind CSS styling  
- NextAuth.js authentication  
- Markdown rendering with GitHub Flavored Markdown support  
- Syntax highlighting for code blocks  
- Diff visualization between documents  

## 🛠️ Tech Stack  
- **Framework**: Next.js 14  
- **Frontend**: React 18  
- **Styling**: Tailwind CSS 3, PostCSS  
- **Authentication**: NextAuth.js 4  
- **Markdown**: react-markdown, remark-gfm, rehype-highlight  
- **Diff Visualization**: react-diff-viewer-continued  
- **Language**: TypeScript 5.7  

## 🚀 Installation  

```bash
npm install
```

## ⚙️ Usage  

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

## 📂 Folder Structure  

- **`.env.example`**: Environment variable template  
- **`.gitignore`**: Git exclusion rules  
- **`app/`**: Next.js App Router directory  
- **`components/`**: Reusable UI components  
- **`lib/`**: Utility functions and business logic  
- **`next-env.d.ts`**: Next.js TypeScript declarations  
- **`next.config.mjs`**: Next.js configuration  
- **`package-lock.json`**: Dependency tree  
- **`package.json`**: Project metadata and dependencies  
- **`postcss.config.js`**: PostCSS configuration  
- **`tailwind.config.ts`**: Tailwind CSS settings  
- **`tsconfig.json`**: TypeScript compiler configuration  
- **`types/`**: Custom type definitions  

## 🧠 Architecture Overview  

- **Next.js App Router** with modern `/app` directory structure  
- **Authentication** via NextAuth.js  
- **Markdown Processing**:  
  - `react-markdown` for rendering  
  - `remark-gfm` for GitHub Flavored Markdown  
  - `rehype-highlight` for syntax highlighting  
- **Diff Visualization** with `react-diff-viewer-continued`  
- **Styling** via Tailwind CSS with PostCSS processing  
- **TypeScript** for type safety throughout the application  
- **Build System**:  
  - Next.js handles SSR/SSG  
  - PostCSS processes Tailwind CSS
