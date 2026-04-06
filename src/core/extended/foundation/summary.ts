import { mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { ensureKontxtIgnoreFile } from "../../ignore-config.js";
import type { FileEntry } from "../../types.js";
import { buildSummaryContext } from "./tree-building.js";

function hasControlCharacters(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if ((code >= 0 && code <= 31) || code === 127) {
      return true;
    }
  }
  return false;
}

export function resolveSummaryFileName(outputFileName?: string): string {
  if (!outputFileName) {
    const date = new Date();
    const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    return `${dateString}-summary.md`;
  }

  const trimmedName = outputFileName.trim();
  if (!trimmedName) {
    throw new Error("Invalid -o value: filename cannot be empty.");
  }
  if (trimmedName === "." || trimmedName === "..") {
    throw new Error("Invalid -o value: filename must not be '.' or '..'.");
  }
  if (hasControlCharacters(trimmedName)) {
    throw new Error("Invalid -o value: filename contains control characters.");
  }
  if (
    trimmedName !== basename(trimmedName) ||
    trimmedName.includes("/") ||
    trimmedName.includes("\\")
  ) {
    throw new Error(
      "Invalid -o value: only a filename is allowed (no path segments).",
    );
  }

  if (trimmedName.toLowerCase().endsWith(".md")) {
    return trimmedName;
  }

  return `${trimmedName}.md`;
}

export async function writeSummaryFile(
  basedir: string,
  content: string,
  outputFileName?: string,
): Promise<string> {
  await ensureKontxtIgnoreFile(basedir);
  const fileName = resolveSummaryFileName(outputFileName);
  const kontxtDir = join(basedir, ".kontxt");
  const summaryFilePath = join(kontxtDir, fileName);
  await mkdir(kontxtDir, { recursive: true });
  await writeFile(summaryFilePath, content, "utf-8");
  return summaryFilePath;
}

export function createSummaryContent(files: FileEntry[]): string {
  return buildSummaryContext(files);
}
