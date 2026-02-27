//  File for filtering through files and checking if we should actually read this file.

import { readFile as readFilefunc } from "node:fs/promises";
import { join } from "node:path";
import { globby } from "globby";
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
      "**/bun.lock",
       "**/bun.lockb",
        "**/package-lock.json",
         "**/yarn.lock",
          "**/pnpm-lock.yaml",
          "**/.gitattributes"
    ], // Explicitly block the junk
    dot: true,
  });

  return path;
}

export async function readOneFile(absolutePath: string, relativepath: string) {
  const joinedPath = join(absolutePath, relativepath);
  const selectedFile = await readFilefunc(joinedPath, "utf-8");
  const encode = getEncoding("cl100k_base");
  const token = encode.encode(selectedFile);
  return { content: selectedFile, token: token.length , path: relativepath};
}

export async function readAllFiles(absolutePath: string) {
  const files = await getFiles(absolutePath);
  const readfilePromise = files.map(file => readOneFile(absolutePath, file)); 
   /*
Here we need to use filter.map because it allows us to create multiple arrays of promises, such as promise file one, file two, like this, so that it uh can be read all that, and the resolution can be given as to the read file promise, which can be resolved down here.
    */
  const fileContent = await Promise.all(readfilePromise);
  return fileContent;
}