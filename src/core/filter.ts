//  File for filtering through files and checking if we should actually read this file.
import { globby } from "globby";
import { readFile as readFilefunc } from "node:fs/promises";
import { join } from "node:path";
import { getEncoding } from "js-tiktoken";

export async function getFiles(directory: string) {
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
    ], // Explicitly block the junk
    dot: true,
  });

  return path;
}

export async function testread(directory: string) {
  const testFileName = "src/core/filter.ts";
  const joinedPath = join(directory, testFileName);
  const file = await readFilefunc(joinedPath, "utf-8");
  const encode = getEncoding("cl100k_base");
  const token = encode.encode(file);
  return { file, tokens: token.length };
}
