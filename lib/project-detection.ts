type Confidence = "high" | "medium" | "low";

type DetectionContext = {
  files: string[];
  packageJson: Record<string, unknown> | null;
  requirementsTxt: string | null;
};

export type ProjectDetectionResult = {
  confidence: Confidence;
  framework: string;
  techStack: string[];
};

type DependencyRule = {
  framework: string;
  packageName: string;
};

const FRAMEWORK_DEPENDENCY_RULES: DependencyRule[] = [
  { framework: "Next.js", packageName: "next" },
  { framework: "React", packageName: "react" },
  { framework: "Angular", packageName: "@angular/core" },
  { framework: "Vue", packageName: "vue" },
  { framework: "Svelte", packageName: "svelte" },
  { framework: "Nuxt", packageName: "nuxt" },
  { framework: "Express", packageName: "express" },
  { framework: "NestJS", packageName: "@nestjs/core" },
];

const BUILD_TOOL_RULES = [
  { name: "Vite", packageName: "vite", files: ["vite.config.ts", "vite.config.js", "vite.config.mjs"] },
  { name: "Webpack", packageName: "webpack", files: ["webpack.config.js", "webpack.config.ts"] },
  { name: "Parcel", packageName: "parcel", files: [".parcelrc"] },
];

const FILE_FRAMEWORK_RULES = [
  { framework: "Next.js", files: ["next.config.js", "next.config.mjs", "next.config.ts"] },
  { framework: "Angular", files: ["angular.json"] },
  { framework: "Nuxt", files: ["nuxt.config.ts", "nuxt.config.js", "nuxt.config.mjs"] },
  { framework: "Svelte", files: ["svelte.config.js", "svelte.config.ts"] },
  { framework: "NestJS", files: ["nest-cli.json"] },
];

function getPackageMap(
  packageJson: Record<string, unknown> | null,
  key: string,
) {
  const candidate = packageJson?.[key];

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return {};
  }

  return candidate as Record<string, unknown>;
}

function getAllPackageNames(packageJson: Record<string, unknown> | null) {
  return new Set([
    ...Object.keys(getPackageMap(packageJson, "dependencies")),
    ...Object.keys(getPackageMap(packageJson, "devDependencies")),
    ...Object.keys(getPackageMap(packageJson, "peerDependencies")),
  ]);
}

function parseRequirements(requirementsTxt: string | null) {
  if (!requirementsTxt) {
    return new Set<string>();
  }

  return new Set(
    requirementsTxt
      .split(/\r?\n/)
      .map((line) => line.trim().toLowerCase())
      .filter(Boolean)
      .filter((line) => !line.startsWith("#"))
      .map((line) => line.split(/[<>=!~[\s;]/)[0])
      .filter(Boolean),
  );
}

function hasAnyFile(files: string[], targets: string[]) {
  const normalizedFiles = new Set(files.map((file) => file.toLowerCase()));
  return targets.some((target) => normalizedFiles.has(target.toLowerCase()));
}

function listLanguages(
  files: string[],
  packageJson: Record<string, unknown> | null,
  requirementsTxt: string | null,
) {
  const languages = new Set<string>();

  if (packageJson) {
    languages.add("Node.js");
  }

  const packageNames = getAllPackageNames(packageJson);

  if (
    packageNames.has("typescript") ||
    hasAnyFile(files, ["tsconfig.json"]) ||
    files.some((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
  ) {
    languages.add("TypeScript");
  }

  if (requirementsTxt || files.some((file) => file.endsWith(".py"))) {
    languages.add("Python");
  }

  if (files.includes("index.html")) {
    languages.add("HTML");
  }

  if (files.includes("style.css") || files.some((file) => file.endsWith(".css"))) {
    languages.add("CSS");
  }

  if (
    files.includes("script.js") ||
    files.some((file) => file.endsWith(".js") || file.endsWith(".jsx"))
  ) {
    languages.add("JavaScript");
  }

  return languages;
}

export function detectProjectStack({
  files,
  packageJson,
  requirementsTxt,
}: DetectionContext): ProjectDetectionResult {
  const frameworks = new Set<string>();
  const inferredFrameworks = new Set<string>();
  const techStack = new Set<string>();
  const packageNames = getAllPackageNames(packageJson);
  const requirementNames = parseRequirements(requirementsTxt);
  const languages = listLanguages(files, packageJson, requirementsTxt);

  for (const rule of FRAMEWORK_DEPENDENCY_RULES) {
    if (packageNames.has(rule.packageName)) {
      frameworks.add(rule.framework);
    }
  }

  if (requirementNames.has("django")) {
    frameworks.add("Django");
  }

  if (requirementNames.has("flask")) {
    frameworks.add("Flask");
  }

  if (requirementNames.has("fastapi")) {
    frameworks.add("FastAPI");
  }

  if (frameworks.size === 0) {
    for (const rule of FILE_FRAMEWORK_RULES) {
      if (hasAnyFile(files, rule.files)) {
        inferredFrameworks.add(rule.framework);
      }
    }
  }

  for (const rule of BUILD_TOOL_RULES) {
    if (packageNames.has(rule.packageName) || hasAnyFile(files, rule.files)) {
      techStack.add(rule.name);
    }
  }

  for (const framework of frameworks) {
    techStack.add(framework);
  }

  for (const framework of inferredFrameworks) {
    techStack.add(framework);
  }

  for (const language of languages) {
    techStack.add(language);
  }

  const hasVanillaFilesOnly =
    frameworks.size === 0 &&
    inferredFrameworks.size === 0 &&
    !packageJson &&
    files.length > 0 &&
    files.every((file) => ["index.html", "style.css", "script.js"].includes(file));

  if (hasVanillaFilesOnly) {
    return {
      framework: "Vanilla Web",
      techStack: ["HTML", "CSS", "JavaScript"],
      confidence: "low",
    };
  }

  if (frameworks.size > 0) {
    return {
      framework: Array.from(frameworks).join(", "),
      techStack: Array.from(techStack),
      confidence: "high",
    };
  }

  if (inferredFrameworks.size > 0) {
    return {
      framework: Array.from(inferredFrameworks).join(", "),
      techStack: Array.from(techStack),
      confidence: "medium",
    };
  }

  return {
    framework: packageJson ? "Unclear (Node.js project)" : "Unclear",
    techStack: Array.from(techStack),
    confidence: hasVanillaFilesOnly ? "low" : "medium",
  };
}
