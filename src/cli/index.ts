import process from "node:process";
import { Command } from "commander";
import {getFiles, readAllFiles } from "../core/filter.js";

const program = new Command();

program
  .name("kontxt")
  .description("Package any codebase into AI-ready context")
  .version("0.0.1")
  .option("-p, --cwd", "prints cwd")
  .option("-d, --dirf", "prints all files in dir")
  // .option("-f, --file", "prints all file in path");
program.parse();
// parse before
const options = program.opts();
if (options.cwd) {
  console.log("current working directory", process.cwd());
}
if (options.dirf) {
  try {
    let cwd = process.cwd()
    console.log(`Reading File for ${cwd} `)
    const output = await readAllFiles(cwd)
    console.log( await getFiles(cwd))
    let totakTokenCost = 0
    for (const item of output){
      console.log(`file name : ${item.path}  || token : ${item.token}`)
      console.log(item.content)
      console.log("\n=============================");
      totakTokenCost+=item.token
    }
    console.log("\n=============================");
    console.log(`Total Files Processed: ${output.length}`);
    console.log(`Total Codebase Tokens: ${totakTokenCost}`);
    console.log("=============================\n")
  } catch (error) {
    console.error("Critical Failure:", error);
  }
}

