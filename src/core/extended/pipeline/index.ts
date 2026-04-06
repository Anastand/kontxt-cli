import type { FileEntry } from "../../types.js";
import { discoverFiles } from "../foundation/discovery.js";
import { scanPaths } from "../foundation/read.js";
import {
  buildRunReport,
  getFilesFromResults,
  type RunReport,
} from "../foundation/report.js";
import {
  createSummaryContent,
  writeSummaryFile,
} from "../foundation/summary.js";

export type ExtendedRunInput = {
  cwd: string;
  outputFileName?: string;
};

export type ExtendedRunOutput = {
  files: FileEntry[];
  summaryPath: string;
  report: RunReport;
};

export async function runExtendedPhaseOne({
  cwd,
  outputFileName,
}: ExtendedRunInput): Promise<ExtendedRunOutput> {
  const discoveredFiles = await discoverFiles(cwd);
  const scanResults = await scanPaths(cwd, discoveredFiles);
  const files = getFilesFromResults(scanResults);
  const context = createSummaryContent(files);
  const summaryPath = await writeSummaryFile(cwd, context, outputFileName);
  const report = buildRunReport(scanResults);

  return {
    files,
    summaryPath,
    report,
  };
}
