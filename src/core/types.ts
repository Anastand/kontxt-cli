export type TokenType = number & { __brand: "token" };
export type SkipReason = "tooLarge" | "binary" | "excluded";

export interface FileEntry {
	relativePath: string;
	absolutePath: string;
	sizeBytes: number;
	tokenCount: TokenType;
	content: string;
}

type ScanResult =
	| { type: "skipped"; reason: SkipReason }
	| {
			type: "file";
			file: FileEntry;
	  }
	| { type: "error"; error: string; path: string };

