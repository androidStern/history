#!/bin/bash

# Print header
echo "# File list generated at $(date)"
echo

# Find all files in src directory and print with comments
find src -type f \
  ! -path "*/\.*" \
  ! -name "*.jpg" \
  ! -name "*.jpeg" \
  ! -name "*.png" \
  ! -name "*.gif" \
  ! -name "*.svg" \
  ! -name "*.css" \
  ! -name "*.ico" | \
while read -r file; do
  echo "# File: $file"
  cat "$file"
  echo -e "\n"
done
