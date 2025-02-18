#!/usr/bin/env bash
set -euo pipefail

# Usage: ./list-files.sh [files-or-directories...]
# Example: ./list-files.sh "*/comp*/**"

if [ $# -eq 0 ]; then
  echo "Usage: $0 <file-or-directory> ..."
  exit 1
fi

for path in "$@"; do
  if [ -f "$path" ]; then
    echo "### File: $path"
    cat "$path"
    echo
  elif [ -d "$path" ]; then
    # Recursively find files in the directory
    find "$path" -type f 2>/dev/null | while IFS= read -r f; do
      echo "### File: $f"
      cat "$f"
      echo
    done
  else
    echo "Skipping: $path (not a file or directory)"
  fi
done
