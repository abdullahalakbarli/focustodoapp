# Migration Status

## ✅ Completed

1. **Directory Structure Created**
   - ✅ Created all new directories (apps/web, services/api, database, docs, etc.)
   - ✅ Created feature-based structure for frontend
   - ✅ Created layered structure for backend

2. **Files Moved**
   - ✅ Core app files (main.tsx, App.tsx, index.css)
   - ✅ Feature pages moved to features/
   - ✅ Shared components, contexts, hooks moved to shared/
   - ✅ Backend files moved to services/api/
   - ✅ Database migrations moved to database/
   - ✅ Documentation moved to docs/
   - ✅ Mobile files moved to apps/mobile/

3. **Configuration Files**
   - ✅ Created apps/web/package.json
   - ✅ Created services/api/package.json
   - ✅ Created root package.json with workspaces
   - ✅ Created vercel.json for frontend deployment
   - ✅ Created render.yaml for backend deployment
   - ✅ Created .env.example files

4. **Import Path Updates**
   - ✅ Updated App.tsx imports
   - ✅ Updated main.tsx imports
   - ✅ Updated FocusPage.tsx imports
   - ✅ Updated server.ts imports

## ⚠️ Remaining Work

### 1. Update Import Paths in Feature Pages

The following files need their import paths updated:

**Auth Feature:**
- `apps/web/src/features/auth/pages/LoginPage.tsx`
- `apps/web/src/features/auth/pages/ResetPasswordPage.tsx`
- `apps/web/src/features/auth/pages/EmailVerificationPage.tsx`

**Other Features:**
- `apps/web/src/features/planner/pages/PlannerPage.tsx`
- `apps/web/src/features/reports/pages/ReportsPage.tsx`
- `apps/web/src/features/profile/pages/ProfilePage.tsx`
- `apps/web/src/features/profile/pages/EditProfilePage.tsx`
- `apps/web/src/features/leaderboard/pages/LeaderboardPage.tsx`
- `apps/web/src/features/admin/pages/AdminAuthPage.tsx`
- `apps/web/src/features/admin/pages/AdminPanelPage.tsx`
- `apps/web/src/features/admin/pages/NotFoundPage.tsx`

**Pattern to update:**
- `@/components/...` → `@/shared/components/...`
- `@/contexts/...` → `@/shared/contexts/...`
- `@/hooks/...` → `@/shared/hooks/...`
- `@/integrations/...` → `@/shared/services/...`
- `@/lib/...` → `@/shared/lib/...`
- `@/types/...` → `@/shared/types/...`
- Feature-specific components should use relative imports: `../components/...`

### 2. Update Component Imports

All component files in `apps/web/src/shared/components/` and feature components need to check their imports.

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd apps/web && npm install

# Install backend dependencies
cd ../../services/api && npm install
```

### 4. Update TypeScript Configs

Update `apps/web/tsconfig.json` to ensure path aliases work correctly:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 5. Test the Application

1. **Frontend:**
   ```bash
   cd apps/web
   npm run dev
   ```
   - Check all routes work
   - Verify all features load correctly
   - Check for console errors

2. **Backend:**
   ```bash
   cd services/api
   npm run dev
   ```
   - Test health endpoint: `curl http://localhost:4000/health`
   - Verify API endpoints work

### 6. Environment Variables

1. Copy `.env` to `apps/web/.env` and ensure all variables have `VITE_` prefix
2. Copy backend env vars to `services/api/.env`

### 7. Clean Up Old Structure

After verifying everything works:
```bash
# Remove old directories (CAREFUL!)
rm -rf src/
rm -rf server/
rm -rf supabase/
# Keep android/ if not moved yet
```

### 8. Update CI/CD (if applicable)

- Update GitHub Actions workflows
- Update Vercel project settings
- Update Render service settings

## Quick Fix Script

You can use find and replace in your IDE:

**Find:** `from "@/components/`
**Replace:** `from "@/shared/components/`

**Find:** `from "@/contexts/`
**Replace:** `from "@/shared/contexts/`

**Find:** `from "@/hooks/`
**Replace:** `from "@/shared/hooks/`

**Find:** `from "@/integrations/`
**Replace:** `from "@/shared/services/`

**Find:** `from "@/lib/`
**Replace:** `from "@/shared/lib/`

**Find:** `from "@/types/`
**Replace:** `from "@/shared/types/`

## Next Steps

1. Run the import path updates (use find/replace)
2. Install dependencies
3. Test locally
4. Update environment variables
5. Deploy to Vercel and Render
6. Clean up old structure

