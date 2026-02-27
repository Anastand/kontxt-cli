import process from "node:process";
import { Command } from "commander";
import { getFiles, readAllFiles } from "../core/filter.js";
import { createSummaryFile, formatContext } from "../core/write.js";

const program = new Command();

program
  .name("kontxt")
  .description("Package any codebase into AI-ready context")
  .version("0.0.1")
  .action(async () => {
    console.log(`Running Default behaviour for the the Kontxt-cli`);
    try {
      const cwd = process.cwd();
      console.log(`Reading File for ${cwd} `);

      const output = await readAllFiles(cwd);

      let totalTokenCost = 0;

      for (const item of output) {
        console.log(`Read the following file  \n : ${item.relativePath}`);
        totalTokenCost += item.tokenCount;
      }
      const content = formatContext(output);
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
// parse before
// const options = program.opts();
// if (options.cwd) {
//   console.log("current working directory", process.cwd());
// }
