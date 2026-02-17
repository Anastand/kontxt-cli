export type TokenType = number & { __brand: "token" };
export type SkipReason = "tooLarge" | "binary" | "excluded";

export interface FileType {
	relativePath: string;
	absolutePath: string;
	sizeBytes: number;
	tokenCount: TokenType;
	content: string;
}

type ScanFileResult =
	| { type: "skipped"; reason: SkipReason }
	| {
			type: "file";
			file: FileType;
	  }
	| { type: "error"; error: string; path: string };

// done in the same file will cahnge and reorder it later

 matches(patterns: string[], path: string): boolean;
 
 
