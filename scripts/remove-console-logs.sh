#!/bin/bash

# Script to remove console.log statements from production code
# Only targets app/, components/, and lib/ folders

echo "Removing console.log statements from production code..."
echo ""

# Find all TypeScript/TSX files in production directories
find app components lib -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
  # Count console.log statements in the file
  count=$(grep -c "console\.log" "$file" 2>/dev/null || echo "0")

  if [ "$count" -gt 0 ]; then
    echo "Cleaning $file ($count console.log statements)..."

    # Remove console.log statements (handles single and multi-line)
    # This removes the entire line containing console.log
    sed -i '' '/console\.log/d' "$file"
  fi
done

echo ""
echo "✅ Console.log cleanup complete!"
echo ""
echo "Verifying cleanup..."
remaining=$(grep -r "console\.log" app components lib --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
echo "Remaining console.log statements: $remaining"
