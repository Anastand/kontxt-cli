import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function makeTempDir(prefix: string = "kontxt-test-") {
  return await mkdtemp(join(tmpdir(), prefix));
}

export async function cleanupTempDir(dir: string) {
  await rm(dir, { recursive: true, force: true });
}

export async function writeFixtureFile(
  rootDir: string,
  relativePath: string,
  content: string,
) {
  const filePath = join(rootDir, relativePath);
  const parentDir = filePath.split("/").slice(0, -1).join("/");
  if (parentDir) {
    await mkdir(parentDir, { recursive: true });
  }
  await writeFile(filePath, content, "utf-8");
}
