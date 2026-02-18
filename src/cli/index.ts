import { Command } from "commander";
import process from "process";
import { getFiles } from "../core/filter.js";
import { testread } from "../core/filter.js";
const program = new Command();

program
  .name("kontxt")
  .description("Package any codebase into AI-ready context")
  .version("0.0.1")
  .option("-p, --cwd", "prints cwd")
  .option("-d, --dirf", "prints all dir and only one file ");
program.parse();
// parse before
const options = program.opts();
if (options.cwd) {
  console.log("current working directory", process.cwd());
}
if (options.dirf) {
  const files = await getFiles(process.cwd()); // WAIT for the data
  console.log("Files found:", files);
  const result = await testread(process.cwd());
  console.log("Token count:", result.tokens);
  console.log("File:", result.file);
}
