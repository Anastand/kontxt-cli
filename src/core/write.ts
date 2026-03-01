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
