# tiny-cli-toolkit

A small collection of zero-dependency CLI utilities for everyday developer workflows.
No frameworks, no build step — just Node.js 18+ and the standard library.

[![CI](https://github.com/seven07-11/tiny-cli-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/seven07-11/tiny-cli-toolkit/actions/workflows/ci.yml)

## Tools

| Command | What it does |
| --- | --- |
| `node src/jsonfmt.js <file>` | Pretty-print and validate a JSON file |
| `node src/sizes.js <dir>` | Report the largest files in a directory tree |
| `node src/dupes.js <dir>` | Find duplicate files by SHA-256 content hash |

## Install

```bash
git clone https://github.com/seven07-11/tiny-cli-toolkit.git
cd tiny-cli-toolkit
# no install step — there are no dependencies
```

## Usage

```bash
# Pretty-print JSON (reads stdin when no file is given)
cat package.json | node src/jsonfmt.js
node src/jsonfmt.js ./config.json

# Largest files under the current directory
node src/sizes.js . --limit 20

# Duplicate detection
node src/dupes.js ./src
```

## Example output

```text
$ node src/sizes.js . --limit 3
    1.2KB  ./src/dupes.js
    1.1KB  ./src/sizes.js
    0.8KB  ./src/jsonfmt.js

7 files, 5.4KB total
```

## Design notes

- **Zero runtime dependencies**, so the tools keep working years from now.
- Every command exits non-zero on error and prints a single readable line to stderr.
- Directories are walked with `fs.opendir` to keep memory flat on large trees.
- Duplicate detection groups by file size first, so only size collisions get hashed.

## Development

```bash
npm test
```

Tests use the built-in `node:test` runner — no test framework to install.

## License

MIT
