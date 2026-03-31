import process from "node:process";
import { Command } from "commander";
import { readAllFiles } from "../core/filter.js";
import {
  createSummaryFile,
  formatContext,
  formatTree,
  getDirStructure,
} from "../core/write.js";

const program = new Command();

type LegacyOptions = {
  output?: string;
};

async function runLegacy(options: LegacyOptions): Promise<void> {
  console.log("Running Default behaviour for the the Kontxt-cli \n");
  const cwd = process.cwd();
  console.log(`Reading File for ${cwd} \n `);

  const output = await readAllFiles(cwd);

  let totalTokenCost = 0;

  const dirStruc = await getDirStructure(cwd); // this is going to get and give the directory structure
  const treeString = formatTree(dirStruc);

  console.log("\n======== Reading the following ======== \n");
  for (const item of output) {
    console.log(`Read :${item.relativePath}`);
    totalTokenCost += item.tokenCount;
  }
  const content = formatContext(output, treeString);
  await createSummaryFile(cwd, content, options.output);

  console.log("\n=============================");
  console.log(`Total Files Processed: ${output.length}`);
  console.log(`Total Codebase Tokens: ${totalTokenCost}`);
  console.log("=============================\n");
}

program
  .name("kontxt")
  .description("Package any codebase into AI-ready context")
  .version("0.0.1")
  .option(
    "-o, --output [name]",
    "Generate summary in .kontxt/ (optional custom file name)",
  );

function printUtilityInfo(): void {
  console.log(
    "Kontxt is a utility to package your codebase into AI-ready context.",
  );
  console.log(
    "Use `kontxt -o` for default output or `kontxt -o <name>` for custom output.",
  );
  console.log("Use `kontxt --help` to see all available options.");
}

async function main(): Promise<void> {
  try {
    program.parse(process.argv);

    if (process.argv.length <= 2) {
      printUtilityInfo();
      return;
    }

    const options = program.opts<{ output?: string | boolean }>();
    if (options.output !== undefined) {
      const normalizedOptions: LegacyOptions = {
        output: typeof options.output === "string" ? options.output : undefined,
      };
      await runLegacy(normalizedOptions);
      return;
    }

    printUtilityInfo();
  } catch (error) {
    console.error("Critical Failure:", error);
    process.exitCode = 1;
  }
}

void main();
