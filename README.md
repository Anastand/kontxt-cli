# kontxt-cli

`kontxt` is a CLI utility that packages a codebase into AI-ready context.

Current goal:
- keep the existing legacy flow stable,
- introduce `extended` architecture safely in phases,
- avoid risky rewrite-in-place changes.

## Current Behavior

### `kontxt`
Prints a short utility message and exits.

### `kontxt -o`
Runs the legacy packaging flow and writes output with default dated naming:
- `.kontxt/<DD-M-YYYY>-summary.md`

### `kontxt -o <name>`
Runs the legacy packaging flow and writes output as:
- `.kontxt/<name>`

`<name>` must be a filename only (no path segments like `nested/file.md`).

## What the Legacy Flow Does

When generation runs (`kontxt -o` or `kontxt -o <name>`), it:
1. Discovers files with ignore rules.
2. Reads file contents.
3. Counts tokens using `cl100k_base` via `js-tiktoken`.
4. Builds a directory tree representation.
5. Writes a summary file under `.kontxt/`.

The output includes:
- a `<tree>` block,
- repeated `<file path="...">...</file>` blocks.

## CLI Usage

```bash
# info only
kontxt

# generate with default dated filename
kontxt -o

# generate with custom filename inside .kontxt/
kontxt -o custom.md

# help
kontxt --help
```

## Project Structure

Current stable modules:
- `src/cli/index.ts` - CLI parsing and top-level execution routing
- `src/core/filter.ts` - file discovery and reading
- `src/core/write.ts` - formatting tree/context and writing summary
- `src/core/types.ts` - shared types

Planned v2 modules will live under:
- `src/core/extended/**`

This isolates new features from the legacy path.

## Extended Thinking Model (Design Intent)

The `extended` path is treated as a deterministic pipeline:
1. collect inputs
2. discover files
3. read safely
4. transform (skeleton-first unless raw requested)
5. secure (redact by default unless forced)
6. assemble output
7. deliver + report

Key principles:
- no hidden side effects between stages,
- clear input/output contracts per stage,
- testable stage isolation,
- legacy fallback remains available during transition.

## Roadmap

Detailed phased plan is tracked in:
- [PHASES.md](./PHASES.md)

## Development

```bash
bun run build
bun run lint
bun test
```

Notes:
- build uses `tsup`,
- lint/format use Biome,
- tests are currently minimal and will expand during phase execution.
