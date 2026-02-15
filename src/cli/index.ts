import { Command } from "commander";

const program = new Command();

program
	.name("kontex-cli")
	.description("Package any codebase into AI-ready context")
	.version("0.0.1");

program.parse();
