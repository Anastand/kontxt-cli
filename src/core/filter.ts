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
