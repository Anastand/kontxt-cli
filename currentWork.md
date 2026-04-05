## Implementation Milestones

---

### 1. Foundation (`extended/foundation`)
**This should ship first.**

**Add:**
- Binary-safe file reads
- Structured per-file result: `file` | `skipped` | `error`
- Bounded concurrency for file processing
- Shared encoder instance
- Token and cost summary

---

### 2. CLI Surface (initial public functionality)
**Add one visible flag only after foundation is stable:**

- `kontxt -o`
- `kontxt --copy`
- Improved output summary

---

### 3. Foundation Tests (Minimum Requirements)

- Skips binary files without crashing
- Throws on invalid output filename
- Single file read failure does not abort the entire run
- Token count and result shape are correct
- Summary file is written

---

### 4. Skeleton Mode (`--skeleton`)
**First major differentiator.**

**Behavior:**
- Supported languages are skeletonized
- Unsupported files fall back safely
- Parse failures do not halt the pipeline

---

### 5. Budget Mode (after skeleton works)

- `--budget <n>`
- Small files: full content; big files: skeletonized
- Hard cap enforcement on total tokens

---

### 6. Security / Redaction

**Crucial for trust:**
- Mask known secrets
- Entropy-based secret detection
- Explicit `--force` override flag

---

### 7. Git-aware Mode (after above are shipped)

- `kontxt diff`
- `kontxt diff --since main`