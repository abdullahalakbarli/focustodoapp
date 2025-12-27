# Migration Guide: Restructuring to Professional Architecture

## Overview
This guide will help you migrate from the current structure to the professional architecture outlined in `ARCHITECTURE.md`.

## Pre-Migration Checklist

- [ ] Backup your current codebase
- [ ] Commit all current changes
- [ ] Ensure all tests pass (if any)
- [ ] Document any custom configurations

## Step-by-Step Migration

### Step 1: Create New Directory Structure

```bash
# Create main directories
mkdir -p apps/web/src/{app,features,shared/{components,contexts,hooks,lib,services,types}}
mkdir -p apps/web/src/features/{auth,focus,planner,reports,profile,leaderboard,admin}/{components,hooks,pages,services,types}
mkdir -p apps/web/src/shared/components/{ui,layout,gamification}
mkdir -p services/api/src/{config,middleware,routes,controllers,services,repositories,utils,types}
mkdir -p database/{migrations,seeds}
mkdir -p docs/{architecture,deployment,development,api}
mkdir -p scripts
mkdir -p apps/mobile
```

### Step 2: Move Frontend Files

#### 2.1 Move Core App Files
```bash
# Move entry point
mv src/main.tsx apps/web/src/
mv src/index.css apps/web/src/
mv src/App.tsx apps/web/src/app/
mv src/App.css apps/web/src/app/
mv index.html apps/web/
```

#### 2.2 Move Feature Files
```bash
# Auth feature
mv src/pages/Auth.tsx apps/web/src/features/auth/pages/LoginPage.tsx
mv src/pages/SignupPage.tsx apps/web/src/features/auth/pages/  # if exists
mv src/pages/ResetPassword.tsx apps/web/src/features/auth/pages/ResetPasswordPage.tsx
mv src/pages/EmailVerification.tsx apps/web/src/features/auth/pages/EmailVerificationPage.tsx

# Focus feature
mv src/pages/Focus.tsx apps/web/src/features/focus/pages/FocusPage.tsx
mv src/components/focus/* apps/web/src/features/focus/components/

# Planner feature
mv src/pages/Planner.tsx apps/web/src/features/planner/pages/PlannerPage.tsx
mv src/components/planner/* apps/web/src/features/planner/components/

# Reports feature
mv src/pages/Reports.tsx apps/web/src/features/reports/pages/ReportsPage.tsx
mv src/components/reports/* apps/web/src/features/reports/components/

# Profile feature
mv src/pages/Profile.tsx apps/web/src/features/profile/pages/ProfilePage.tsx
mv src/pages/EditProfile.tsx apps/web/src/features/profile/pages/EditProfilePage.tsx
mv src/components/profile/* apps/web/src/features/profile/components/

# Leaderboard feature
mv src/pages/Leaderboard.tsx apps/web/src/features/leaderboard/pages/LeaderboardPage.tsx

# Admin feature
mv src/pages/AdminAuth.tsx apps/web/src/features/admin/pages/AdminAuthPage.tsx
mv src/pages/AdminPanel.tsx apps/web/src/features/admin/pages/AdminPanelPage.tsx
```

#### 2.3 Move Shared Files
```bash
# Shared components
mv src/components/ui/* apps/web/src/shared/components/ui/
mv src/components/BottomNav.tsx apps/web/src/shared/components/layout/
mv src/components/gamification/* apps/web/src/shared/components/gamification/

# Contexts
mv src/contexts/* apps/web/src/shared/contexts/

# Hooks
mv src/hooks/* apps/web/src/shared/hooks/

# Lib
mv src/lib/* apps/web/src/shared/lib/

# Services
mv src/integrations/supabase/* apps/web/src/shared/services/supabase/

# Types
mv src/types/* apps/web/src/shared/types/
```

#### 2.4 Move Configuration Files
```bash
# Frontend config
mv vite.config.ts apps/web/
mv tsconfig.json apps/web/
mv tsconfig.app.json apps/web/
mv tsconfig.node.json apps/web/
mv tailwind.config.ts apps/web/
mv postcss.config.js apps/web/
mv components.json apps/web/
mv eslint.config.js apps/web/
```

### Step 3: Move Backend Files

```bash
# Backend structure
mv server/index.js services/api/src/server.ts
mv server/db.js services/api/src/config/database.ts
mv server/email.js services/api/src/services/email.service.ts
mv server/security.js services/api/src/utils/security.ts

# Create new backend structure
# You'll need to refactor server.ts into:
# - services/api/src/app.ts (Express app setup)
# - services/api/src/server.ts (Server entry)
# - services/api/src/routes/auth.routes.ts
# - services/api/src/controllers/auth.controller.ts
# - services/api/src/services/auth.service.ts
```

### Step 4: Move Database Files

```bash
mv supabase/migrations/* database/migrations/
mv supabase/config.toml database/
```

### Step 5: Move Mobile Files

```bash
mv android apps/mobile/
mv capacitor.config.ts apps/mobile/
```

### Step 6: Move Documentation

```bash
mv BACKEND_SETUP.md docs/deployment/RENDER_SETUP.md
mv DOMAIN_SETUP.md docs/deployment/
mv SUPABASE_CONFIG.md docs/deployment/
mv QUICK_EMAIL_SETUP.md docs/deployment/
mv NEXT_STEPS.md docs/development/
```

### Step 7: Update Package.json Files

#### 7.1 Create Root Package.json (if monorepo)
```json
{
  "name": "focustodoapp",
  "private": true,
  "workspaces": [
    "apps/*",
    "services/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^1.10.0"
  }
}
```

#### 7.2 Update Frontend Package.json
```json
{
  "name": "@focustodoapp/web",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

#### 7.3 Create Backend Package.json
```json
{
  "name": "@focustodoapp/api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint ."
  }
}
```

### Step 8: Update Import Paths

You'll need to update all import statements. Use find and replace:

```bash
# Example: Update imports in features
# From: import { ... } from "@/components/..."
# To: import { ... } from "@/shared/components/..."

# From: import { ... } from "@/pages/..."
# To: import { ... } from "@/features/[feature]/pages/..."
```

### Step 9: Update Vite Config

Update `apps/web/vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Step 10: Update TypeScript Configs

Update path aliases in `apps/web/tsconfig.json`:

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

### Step 11: Create Environment Files

```bash
# Frontend
cp .env apps/web/.env.example
# Add VITE_ prefix to frontend variables

# Backend
cp .env services/api/.env.example
# Keep backend variables as-is
```

### Step 12: Update Deployment Configs

#### Vercel (Frontend)
Create `apps/web/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

#### Render (Backend)
Create `services/api/render.yaml`:
```yaml
services:
  - type: web
    name: focustodo-api
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

### Step 13: Clean Up Old Structure

After verifying everything works:

```bash
# Remove old directories (be careful!)
rm -rf src/
rm -rf server/
rm -rf supabase/
rm -rf android/  # if moved to apps/mobile
```

## Post-Migration Checklist

- [ ] All imports updated and working
- [ ] Frontend builds successfully
- [ ] Backend starts successfully
- [ ] All features work as expected
- [ ] Tests pass (if any)
- [ ] Environment variables configured
- [ ] Deployment configs updated
- [ ] Documentation updated
- [ ] CI/CD pipelines updated

## Troubleshooting

### Import Errors
- Check path aliases in `tsconfig.json` and `vite.config.ts`
- Verify all files moved to correct locations
- Use absolute imports with `@/` prefix

### Build Errors
- Clear `node_modules` and reinstall
- Check TypeScript config
- Verify all dependencies in package.json

### Runtime Errors
- Check environment variables
- Verify API endpoints
- Check console for errors

## Rollback Plan

If something goes wrong:

1. Restore from git backup
2. Check git log for previous working state
3. Revert commits if needed
4. Fix issues incrementally

## Next Steps

1. Set up monorepo tooling (Turborepo, Nx, or npm workspaces)
2. Add proper testing structure
3. Set up CI/CD pipelines
4. Add code quality tools (Prettier, Husky)
5. Create feature flags system
6. Add monitoring and logging

