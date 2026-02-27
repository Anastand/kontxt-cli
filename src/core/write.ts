import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FileEntry } from "./types.js";

export function formatContext(files: FileEntry[]) {
  const convertedFile = files.map(
    (file) =>
      `<file path="${file.relativePath}">\n${file.content}\n</file> \n`,
  );
  return convertedFile.join("\n");
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
