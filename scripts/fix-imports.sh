#!/bin/bash

# Script to fix import paths in the new structure
# Run from project root: ./scripts/fix-imports.sh

echo "🔧 Fixing import paths..."

cd apps/web/src || exit 1

# Find and replace common import patterns
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  -e 's|from "@/components/|from "@/shared/components/|g' \
  -e 's|from "@/contexts/|from "@/shared/contexts/|g' \
  -e 's|from "@/hooks/|from "@/shared/hooks/|g' \
  -e 's|from "@/integrations/|from "@/shared/services/|g' \
  -e 's|from "@/lib/|from "@/shared/lib/|g' \
  -e 's|from "@/types/|from "@/shared/types/|g' \
  {} \;

echo "✅ Import paths updated!"
echo "⚠️  Please review the changes and test your application"

