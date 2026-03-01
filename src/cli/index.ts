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
