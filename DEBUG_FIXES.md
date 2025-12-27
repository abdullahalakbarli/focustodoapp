# Debug Fixes Applied

## Issues Found and Fixed

### 1. ✅ BottomNav Import Path (Fixed)
**Issue**: Multiple pages were importing `BottomNav` from `@/shared/components/BottomNav` but the file is actually at `@/shared/components/layout/BottomNav`.

**Files Fixed**:
- `apps/web/src/features/leaderboard/pages/LeaderboardPage.tsx`
- `apps/web/src/features/profile/pages/ProfilePage.tsx`
- `apps/web/src/features/planner/pages/PlannerPage.tsx`
- `apps/web/src/features/reports/pages/ReportsPage.tsx`

**Fix**: Changed imports from `@/shared/components/BottomNav` to `@/shared/components/layout/BottomNav`

### 2. ✅ Feature Component Imports (Fixed)
**Issue**: Pages were importing feature-specific components from `@/shared/components/` but they should import from their own feature folders.

**Files Fixed**:
- `apps/web/src/features/planner/pages/PlannerPage.tsx`
  - Changed `@/shared/components/planner/TaskList` → `../components/TaskList`
  - Changed `@/shared/components/focus/TaskForm` → `@/features/focus/components/TaskForm`
- `apps/web/src/features/reports/pages/ReportsPage.tsx`
  - Changed `@/shared/components/reports/StatsCards` → `../components/StatsCards`
  - Changed `@/shared/components/reports/FocusChart` → `../components/FocusChart`
  - Changed `@/shared/components/reports/ExportButtons` → `../components/ExportButtons`
- `apps/web/src/features/profile/pages/ProfilePage.tsx`
  - Changed `@/shared/components/profile/ProfileInfo` → `../components/ProfileInfo`

### 3. ✅ Backend TypeScript Execution (Fixed)
**Issue**: Backend was trying to run `.ts` files directly with `node`, which doesn't support TypeScript.

**File Fixed**: `services/api/package.json`
- Changed `dev` script from `node --watch src/server.ts` to `tsx watch src/server.ts`
- Changed `start` script from `node src/server.ts` to `tsx src/server.ts`
- Added `tsx` as a dev dependency
- Installed `tsx` package

## Verification

### Frontend Build
✅ Frontend builds successfully:
```bash
cd apps/web && npm run build
# ✓ built in 6.13s
```

### Backend
✅ Backend dependencies installed:
- `tsx` installed and ready to run TypeScript files

## Remaining Steps

1. **Install backend dependencies** (if not done):
   ```bash
   cd services/api && npm install
   ```

2. **Test the application**:
   ```bash
   # From project root
   npm run dev
   ```

3. **Verify both servers start**:
   - Frontend should be on http://localhost:5173 (or 5174 if 5173 is in use)
   - Backend should be on http://localhost:4000

4. **Test endpoints**:
   ```bash
   curl http://localhost:4000/health
   ```

## Summary

All import path issues have been resolved:
- ✅ BottomNav imports fixed (4 files)
- ✅ Feature component imports fixed (3 files)
- ✅ Backend TypeScript execution fixed
- ✅ Frontend builds successfully
- ✅ Backend dependencies installed

The application should now run without import errors!

