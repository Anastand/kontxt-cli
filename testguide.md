# Test Guide (`kontxt-cli`)

This file explains the current test suite, what each test file validates, and how to run tests reliably.

## Test Files

- `tests/core.legacy.test.ts`
- `tests/cli.legacy.test.ts`
- `tests/faultfinding.rigorous.test.ts`
- `tests/helpers/temp.ts` (shared helper, not a test suite)

## How To Run

Run all tests:

```bash
bun test
```

Run a single suite:

```bash
bun test tests/core.legacy.test.ts
bun test tests/cli.legacy.test.ts
bun test tests/faultfinding.rigorous.test.ts
```

Recommended sanity checks after test updates:

```bash
bun run build
bun run lint
```

## Suite Breakdown

## `tests/core.legacy.test.ts`

Purpose: validate deterministic legacy behavior of core functions.

Coverage:
- Tree formatting helpers:
  - `buildTree`
  - `renderTree`
  - `formatTree`
- Context serialization:
  - `formatContext` output shape (`<tree>`, `<file path="...">`)
- Summary writing:
  - default dated filename when output name is omitted
  - custom filename under `.kontxt/`
  - invalid filename rejection (`""`, `.`, `..`, `nested/custom.md`)
- Discovery/read behaviors:
  - ignore rules in `getFiles`
  - unknown extension + extensionless files are included where expected
  - `readOneFile` metadata/content assertions
  - `readAllFiles` happy path
  - explicit read failure scenarios (directory input, unreadable file)

Time handling:
- Date is frozen for deterministic default filename assertion.

## `tests/cli.legacy.test.ts`

Purpose: smoke-test built CLI behavior at process level.

Coverage:
- `kontxt` (no args) prints utility info and exits success.
- `kontxt -o` creates default dated summary file.
- `kontxt -o custom.md` creates custom summary file.
- `kontxt -o nested/custom.md` exits non-zero with validation error.

Implementation details:
- Builds `dist/index.js` in `beforeAll`.
- Uses temp workspace directories for each test.
- Uses a bootstrap runner with frozen `Date` for deterministic `-o` default filename.

## `tests/faultfinding.rigorous.test.ts`

Purpose: stronger fault-finding/security-hardening expectations beyond current legacy baseline.

Checks included:
- path traversal protection in `readOneFile`
- per-file read failure isolation in `readAllFiles`
- binary-file skipping
- escaping content that can break `<file>` framing
- ignore-policy consistency between discovery and tree generation
- deterministic tree rendering regardless of input order
- output filename control-character rejection

Important:
- This suite currently identifies gaps in legacy behavior.
- It is intended as a rigorous target suite and may fail until those protections are implemented.

## Helper: `tests/helpers/temp.ts`

Shared utilities:
- create isolated temp directories
- clean up temp directories
- create fixture files with parent directories

This keeps tests isolated from repo state and avoids writing to source paths.

## Current Testing Model

- Legacy baseline confidence: `core.legacy` + `cli.legacy`.
- Hardening target confidence: `faultfinding.rigorous`.
- Extended implementation work should progressively convert rigorous failures into passes.
