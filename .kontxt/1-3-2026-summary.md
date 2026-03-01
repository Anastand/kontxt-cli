<tree>
├── README.md
├── biome.json
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── src/
    ├── core/
    │   ├── filter.ts
    │   ├── types.ts
    │   └── write.ts
    └── cli/
        └── index.ts

</tree>

<file path=".gitignore">
# dependencies (bun install)
node_modules

# output
out
dist
*.tgz

# code coverage
coverage
*.lcov

# logs
logs
_.log
report.[0-9]_.[0-9]_.[0-9]_.[0-9]_.json

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# caches
.eslintcache
.cache
*.tsbuildinfo

# IntelliJ based IDEs
.idea

# Finder (MacOS) folder config
.DS_Store

</file> 

<file path="README.md">
> will be updated soon
</file> 

<file path="biome.json">
{
  "$schema": "https://biomejs.dev/schemas/2.3.15/schema.json",
  "assist": { "actions": { "source": { "organizeImports": "on" } } },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80
  }
}

</file> 

<file path="package.json">
{
	"name": "kontxt-cli",
	"module": "index.ts",
	"type": "module",
	"private": true,
	"bin": {
		"kontxt": "./dist/index.js"
	},
	"scripts": {
		"build": "tsup",
		"lint": "biome check src/",
		"format": "biome format --write src/",
		"test": "bun test"
	},
	"files": [
		"dist"
	],
	"devDependencies": {
		"@biomejs/biome": "^2.3.15",
		"@types/bun": "latest",
		"@types/node": "^25.2.3",
		"tsup": "^8.5.1"
	},
	"peerDependencies": {
		"typescript": "^5.9.3"
	},
	"dependencies": {
		"chalk": "^5.6.2",
		"clipboardy": "^5.3.0",
		"commander": "^14.0.3",
		"globby": "^16.1.0",
		"js-tiktoken": "^1.0.21"
	}
}

</file> 

<file path="tsconfig.json">
{
	"compilerOptions": {
		"target": "ES2022",
		"module": "NodeNext",
		"moduleResolution": "NodeNext",
		"strict": true,
		"esModuleInterop": true,
		"outDir": "dist",
		"rootDir": "src",
		"declaration": true,
		"skipLibCheck": true,
		"forceConsistentCasingInFileNames": true,
		"resolveJsonModule": true,
		"isolatedModules": true,
		"types": ["bun-types", "node"],
	},
	"include": ["src"],
	"exclude": ["node_modules", "dist", "tests"],
}

</file> 

<file path="tsup.config.ts">
import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/cli/index.ts"],
	format: ["esm"],
	target: "node18",
	clean: true,
	splitting: false,
	dts: true,
	banner: {
		js: "#!/usr/bin/env node",
	},
});

</file> 

<file path="src/cli/index.ts">
import process from "node:process";
import { Command } from "commander";
import { readAllFiles } from "../core/filter.js";
import {
  buildTree,
  createSummaryFile,
  formatContext,
  formatTree,
  getDirStructure,
  renderTree,
} from "../core/write.js";

const program = new Command();

program
  .name("kontxt")
  .description("Package any codebase into AI-ready context")
  .version("0.0.1")
  .action(async () => {
    console.log(`Running Default behaviour for the the Kontxt-cli \n`);
    try {
      const cwd = process.cwd();
      console.log(`Reading File for ${cwd} \n `);

      const output = await readAllFiles(cwd);

      let totalTokenCost = 0;

      const dirStruc = await getDirStructure(cwd); // this is going to get and give the directory structure
      const treeString = formatTree(dirStruc);

      console.log(`\n======== Reading the following ======== \n`);
      for (const item of output) {
        console.log(`Read :${item.relativePath}`);
        totalTokenCost += item.tokenCount;
      }
      const content = formatContext(output, treeString);
      await createSummaryFile(cwd, content);

      console.log("\n=============================");
      console.log(`Total Files Processed: ${output.length}`);
      console.log(`Total Codebase Tokens: ${totalTokenCost}`);
      console.log("=============================\n");
    } catch (error) {
      console.error("Critical Failure:", error);
    }
  });

program.parse();

</file> 

<file path="src/core/filter.ts">
//  File for filtering through files and checking if we should actually read this file.

import { readFile as readFilefunc, stat } from "node:fs/promises";
import { join } from "node:path";
import { globby } from "globby";
import { getEncoding } from "js-tiktoken";
import type { FileEntry, TokenType } from "./types.js";

export async function getFiles(directory: string): Promise<string[]> {
  // Implementation of getFiles function
  const path = await globby(["**/*"], {
    cwd: directory,
    expandDirectories: true,
    gitignore: true,
    ignore: [
      "**/node_modules/**",
      "**/.git/**",
      "**/.cursor/**",
      "**/.vscode/**",
      "**/.idea/**",
      "**/.DS_Store/**",
      "**/bun.lock",
      "**/bun.lockb",
      "**/package-lock.json",
      "**/yarn.lock",
      "**/pnpm-lock.yaml",
      "**/.gitattributes",
      "**/.kontxt/**",
    ], // Explicitly block the junk
    dot: true,
  });

  return path;
}

export async function readOneFile(
  absolutePath: string,
  relativePath: string,
): Promise<FileEntry> {
  const absoluteFilePath = join(absolutePath, relativePath);
  const selectedFile = await readFilefunc(absoluteFilePath, "utf-8");
  const stats = await stat(absoluteFilePath);
  const encode = getEncoding("cl100k_base");
  const tokenCount = encode.encode(selectedFile).length as TokenType;
  return {
    relativePath,
    absolutePath: absoluteFilePath,
    sizeBytes: stats.size,
    tokenCount,
    content: selectedFile,
  };
}

export async function readAllFiles(absolutePath: string): Promise<FileEntry[]> {
  const files = await getFiles(absolutePath);
  const readfilePromise = files.map((file) => readOneFile(absolutePath, file));
  /*
Here we need to use filter.map because it allows us to create multiple arrays of promises, such as promise file one, file two, like this, so that it uh can be read all that, and the resolution can be given as to the read file promise, which can be resolved down here.
    */
  const fileContent = await Promise.all(readfilePromise);
  return fileContent;
}

</file> 

<file path="src/core/types.ts">
export type TokenType = number & { __brand: "token" };
export type SkipReason = "tooLarge" | "binary" | "excluded";

export type TreeNode = { [key: string]: TreeNode | null };

export interface FileEntry {
  relativePath: string;
  absolutePath: string;
  sizeBytes: number;
  tokenCount: TokenType;
  content: string;
}

export type ScanResult =
  | { type: "skipped"; reason: SkipReason }
  | {
      type: "file";
      file: FileEntry;
    }
  | { type: "error"; error: string; path: string };

</file> 

<file path="src/core/write.ts">
import { mkdir, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import type { FileEntry, TreeNode } from "./types.js";

export function buildTree(paths: string[]) {
  let tree: TreeNode = {};
  for (const path of paths) {
    let current = tree;
    const partOfPath = path.split("/");
    for (let i = 0; i < partOfPath.length; i++) {
      const lastIndex = i === partOfPath.length - 1;
      if (lastIndex) {
        current[partOfPath[i]] = null;
      } else if (!current[partOfPath[i]]) {
        current[partOfPath[i]] = {};
      }
      if (!lastIndex) current = current[partOfPath[i]] as TreeNode;
    }
  }
  return tree;
}

export function renderTree(node: TreeNode, prefix: string = ""): string {
  const keys = Object.keys(node);
  console.log(keys);
  const lastConnector = "└── ";
  const normalConnector = "├── ";
  const newLine = "\n";
  const folderPostfix = "/";
  let result = "";
  keys.forEach((key, value) => {
    const isLast = value === keys.length - 1;
    const connector = isLast ? lastConnector : normalConnector;
    const childPrefix = isLast ? prefix + "    " : prefix + "│   ";
    const isFolder = node[key] != null;
    result +=
      prefix + connector + key + (isFolder ? folderPostfix : "") + newLine;
    if (isFolder) {
      result += renderTree(node[key] as TreeNode, childPrefix);
    }
  });
  return result;
}

export async function getDirStructure(directory: string) {
  let dirStructure = [] as string[];
  const IGNORE_DIRS = new Set([
    "node_modules",
    ".git",
    ".kontxt",
    ".cursor",
    ".vscode",
    ".idea",
    ".DS_Store",
    "bun.lock",
    "bun.lockb",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    ".gitattributes",
    ".gitignore",
    ".prettierignore",
    ".prettierconfig",
    "dist",
  ]);
  const ignoreExtensions = new Set([
    "mp4",
    "mp3",
    "wav",
    "ogg",
    "png",
    "jpg",
    "jpeg",
    "gif",
    "bmp",
    "tiff",
    "ico",
    "webp",
    "svg",
  ]);
  const entries = await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  });

  for (const entry of entries) {
    const parts = entry.parentPath
      .replace(directory, "")
      .split("/")
      .filter(Boolean);
    if (parts.some((p) => IGNORE_DIRS.has(p))) {
      continue;
    }
    const extension = entry.name.split(".").pop();
    if (extension && ignoreExtensions.has(extension)) {
      continue;
    }
    if (entry.isDirectory()) continue;
    if (IGNORE_DIRS.has(entry.name)) {
      continue;
    }
    const relativePath = entry.parentPath
      .replace(directory, "")
      .concat("/" + entry.name)
      .slice(1);
    dirStructure.push(relativePath);
  }
  return dirStructure;
}

export function formatTree(paths: string[]): string {
  const tree = buildTree(paths);
  return renderTree(tree);
}

export function formatContext(files: FileEntry[], tree: string) {
  const treeContent = `<tree>\n${tree}\n</tree>\n`;

  const convertedFile = files.map(
    (file) => `<file path="${file.relativePath}">\n${file.content}\n</file> \n`,
  );
  return [treeContent, ...convertedFile].join("\n");
}

export async function createSummaryFile(
  basedir: string,
  content: string,
): Promise<void> {
  const date = new Date();
  const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  const fileName = `${dateString}-summary.md`;
  const kontxtDir = join(basedir, ".kontxt");
  const kontxtSummaryFileName = join(kontxtDir, fileName);

  await mkdir(kontxtDir, { recursive: true });
  await writeFile(kontxtSummaryFileName, content);
}

</file> 
