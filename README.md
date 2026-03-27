# Kontxt CLI Implementation Plan

## Summary
Implement Plan 1’s feature and sequencing decisions, but place all major new capabilities in `src/core/extended/**` to keep existing core files stable and reduce churn.

Chosen defaults:
- AST engine: **Tree-sitter**
- CLI strategy: **Minimal CLI changes first** (single entrypoint orchestrating extended modules)

## Repository Structure and Ownership
Keep existing modules:
- `src/core/filter.ts` (base scan/read behavior, thin wrappers)
- `src/core/write.ts` (base formatting/tree behavior, thin wrappers)
- `src/core/types.ts` (shared types)
- `src/cli/index.ts` (primary command wiring)

Add new modules under:
- `src/core/extended/foundation/` (encoder singleton, concurrency, binary guard, ignore constants, cost)
- `src/core/extended/skeleton/` (parser, queries, extractor, index)
- `src/core/extended/budget/` (budget engine + output formatter)
- `src/core/extended/security/` (pattern detect, entropy detect, redaction)
- `src/core/extended/git/` (git helpers + diff context builder)
- `src/core/extended/dx/` (`.kontxtignore`, interactive selection helpers)

Rule: `src/cli/index.ts` calls orchestrators in `src/core/extended/*`; existing core files remain compatibility-friendly.

## Phase Plan (Execution Order)

### Phase 1: Foundation Fixes & Quick Wins (3-4 days)
Implement in `src/core/extended/foundation/`:
- `encoding.ts`: singleton `js-tiktoken` encoder (`cl100k_base`)
- `concurrency.ts`: `p-limit` wrapper for bounded reads
- `binary.ts`: null-byte detection from first 512 bytes
- `constants.ts`: unified ignore sources (dirs/files/extensions + globby patterns)
- `cost.ts`: model input cost estimator

Integrate into current flow:
- `readOneFile` returns `ScanResult` (`file | skipped | error`)
- `readAllFiles` uses bounded concurrency
- CLI adds `--copy`, `--output`, and summary/cost display

Public interfaces added:
- `kontxt --copy`
- `kontxt --output <path>`

### Phase 2: Skeleton Mode with Tree-sitter (7-10 days)
Implement in `src/core/extended/skeleton/`:
- `parser.ts`: one-time init + grammar cache
- `extractor.ts`: keep/strip traversal
- `queries/typescript.ts`, `queries/javascript.ts`, `queries/python.ts`
- `index.ts`: `skeletonize(file) => string | null`

Build/runtime:
- add grammar copy step to build
- ensure grammar path resolution works in `dist`

CLI flag:
- `--skeleton` skeletonizes supported files, keeps unsupported raw

Public interfaces added:
- `kontxt --skeleton`

### Phase 3: Budget Mode (3-4 days, depends on Phase 2)
Implement in `src/core/extended/budget/`:
- `budget.ts`: small files full, large files skeleton, strict token cap
- `formatBudgetContext` with explicit instruction block for follow-up asks

CLI integration:
- `--budget <tokens>`
- show budget used + omitted counts

Public interfaces added:
- `kontxt --budget <tokens>`

### Phase 4: Security and Secret Redaction (5-6 days, parallel-capable)
Implement in `src/core/extended/security/`:
- `patterns.ts`: regex secret families
- `entropy.ts`: Shannon entropy with filters
- `redact.ts`: regex-first then entropy pass, no double-redact

Middleware position:
- always before final output routing
- bypass only with `--force`

Public interfaces added:
- `kontxt --force`

### Phase 5: Git Intelligence (5-6 days, depends on Phase 2)
Implement in `src/core/extended/git/`:
- `git.ts`: repo check, uncommitted file set, `--since` diff set
- `git-context.ts`: full changed + skeleton others

CLI command:
- `kontxt diff`
- `kontxt diff --since <branch>`

Public interfaces added:
- `kontxt diff`
- `kontxt diff --since <branch>`

### Phase 6: DX, Config, Test, Ship (5-7 days)
Implement in `src/core/extended/dx/`:
- `.kontxtignore` loader + merge with base ignore
- interactive selector (`@inquirer/prompts`)

CLI additions:
- `--interactive`
- `kontxt init`

Finalize README, tests, publish metadata.

## Public API/Interface Changes (Consolidated)
Commands:
- `kontxt` (default export)
- `kontxt diff`
- `kontxt init`

Flags:
- `--copy`
- `--output <path>`
- `--skeleton`
- `--budget <tokens>`
- `--force`
- `--interactive`
- `diff --since <branch>`

## Test Cases and Acceptance Scenarios
Foundation:
- encoder instantiated once across many files
- binary file skipped, no crash
- per-file read failure returns `ScanResult.error`, run continues

Skeleton:
- TS/JS/Python fixtures strip bodies and keep declarations/imports
- unsupported extension returns `null`, raw preserved
- parse failure falls back cleanly

Budget:
- hard cap never exceeded
- small-file-first behavior works
- omitted file count and metadata correct

Security:
- known keys are redacted by default
- entropy catches synthetic unknown secrets with bounded false positives
- `--force` disables redaction and prints warning

Git:
- dirty working tree file detection
- `--since main` changed-file detection
- hybrid full/skeleton mapping correctness

DX:
- `.kontxtignore` patterns applied
- interactive selection includes only chosen files
- `init` creates template only when missing/with overwrite policy defined

## Assumptions and Defaults
- Runtime remains Node 18+ with current tsup pipeline.
- Existing output format remains backward compatible unless explicitly versioned.
- Tree-sitter grammars are packaged under `dist/grammars`.
- Minimal CLI refactor is intentional in early phases; module split can be deferred to post-v1 cleanup.
- Phase 4 may run in parallel, but integration into output pipeline is gated before release.
