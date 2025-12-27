# FocusTodo App - Professional Architecture

## Recommended Folder Structure

```
focustodoapp/
├── .github/                          # GitHub workflows and templates
│   ├── workflows/
│   │   ├── ci.yml                   # CI/CD pipeline
│   │   ├── deploy-frontend.yml      # Vercel deployment
│   │   └── deploy-backend.yml       # Render deployment
│   └── ISSUE_TEMPLATE/
│
├── apps/                             # Application layer (monorepo apps)
│   ├── web/                         # Frontend React app (Vercel)
│   │   ├── public/                  # Static assets
│   │   │   ├── favicon.ico
│   │   │   └── robots.txt
│   │   ├── src/
│   │   │   ├── app/                 # App-level configuration
│   │   │   │   ├── App.tsx
│   │   │   │   ├── App.css
│   │   │   │   └── routes.tsx      # Route definitions
│   │   │   │
│   │   │   ├── features/            # Feature-based modules
│   │   │   │   ├── auth/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   └── AuthForm.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── useAuth.ts
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   ├── LoginPage.tsx
│   │   │   │   │   │   ├── SignupPage.tsx
│   │   │   │   │   │   ├── ResetPasswordPage.tsx
│   │   │   │   │   │   └── EmailVerificationPage.tsx
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── authService.ts
│   │   │   │   │   └── types/
│   │   │   │   │       └── auth.types.ts
│   │   │   │   │
│   │   │   │   ├── focus/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── TimerDisplay.tsx
│   │   │   │   │   │   ├── CategorySelector.tsx
│   │   │   │   │   │   └── CustomCategoryDialog.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── useFocus.ts
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── FocusPage.tsx
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── focusService.ts
│   │   │   │   │   └── types/
│   │   │   │   │       └── focus.types.ts
│   │   │   │   │
│   │   │   │   ├── planner/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── TaskList.tsx
│   │   │   │   │   │   └── TaskForm.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── useTasks.ts
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── PlannerPage.tsx
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── taskService.ts
│   │   │   │   │   └── types/
│   │   │   │   │       └── task.types.ts
│   │   │   │   │
│   │   │   │   ├── reports/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── FocusChart.tsx
│   │   │   │   │   │   ├── StatsCards.tsx
│   │   │   │   │   │   └── ExportButtons.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── useReports.ts
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── ReportsPage.tsx
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── reportService.ts
│   │   │   │   │   └── types/
│   │   │   │   │       └── report.types.ts
│   │   │   │   │
│   │   │   │   ├── profile/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   └── ProfileInfo.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── useProfile.ts
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   ├── ProfilePage.tsx
│   │   │   │   │   │   └── EditProfilePage.tsx
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── profileService.ts
│   │   │   │   │   └── types/
│   │   │   │   │       └── profile.types.ts
│   │   │   │   │
│   │   │   │   ├── leaderboard/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   └── LeaderboardTable.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── useLeaderboard.ts
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── LeaderboardPage.tsx
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── leaderboardService.ts
│   │   │   │   │   └── types/
│   │   │   │   │       └── leaderboard.types.ts
│   │   │   │   │
│   │   │   │   └── admin/
│   │   │   │       ├── components/
│   │   │   │       ├── hooks/
│   │   │   │       ├── pages/
│   │   │   │       │   ├── AdminAuthPage.tsx
│   │   │   │       │   └── AdminPanelPage.tsx
│   │   │   │       └── services/
│   │   │   │
│   │   │   ├── shared/              # Shared across features
│   │   │   │   ├── components/      # Reusable UI components
│   │   │   │   │   ├── ui/          # shadcn/ui components
│   │   │   │   │   ├── layout/
│   │   │   │   │   │   ├── BottomNav.tsx
│   │   │   │   │   │   └── Header.tsx
│   │   │   │   │   └── gamification/
│   │   │   │   │       ├── PointsDisplay.tsx
│   │   │   │   │       └── AchievementsDialog.tsx
│   │   │   │   │
│   │   │   │   ├── contexts/        # React contexts
│   │   │   │   │   ├── ThemeContext.tsx
│   │   │   │   │   ├── TimerContext.tsx
│   │   │   │   │   └── AdminContext.tsx
│   │   │   │   │
│   │   │   │   ├── hooks/           # Shared hooks
│   │   │   │   │   ├── use-mobile.tsx
│   │   │   │   │   ├── use-toast.tsx
│   │   │   │   │   └── usePoints.ts
│   │   │   │   │
│   │   │   │   ├── lib/             # Utilities and helpers
│   │   │   │   │   ├── utils.ts
│   │   │   │   │   ├── constants.ts
│   │   │   │   │   └── validators.ts
│   │   │   │   │
│   │   │   │   ├── services/        # API clients
│   │   │   │   │   ├── api/
│   │   │   │   │   │   ├── client.ts
│   │   │   │   │   │   └── endpoints.ts
│   │   │   │   │   └── supabase/
│   │   │   │   │       ├── client.ts
│   │   │   │   │       └── types.ts
│   │   │   │   │
│   │   │   │   └── types/           # Shared TypeScript types
│   │   │   │       ├── common.types.ts
│   │   │   │       └── capacitor-preferences.d.ts
│   │   │   │
│   │   │   ├── main.tsx             # Entry point
│   │   │   └── index.css             # Global styles
│   │   │
│   │   ├── .env.example              # Environment variables template
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.js
│   │   ├── components.json          # shadcn/ui config
│   │   └── package.json
│   │
│   └── mobile/                       # Mobile app (Capacitor)
│       ├── android/                  # Android native code
│       ├── ios/                      # iOS native code
│       ├── capacitor.config.ts
│       └── package.json
│
├── packages/                         # Shared packages (if monorepo)
│   ├── api-client/                  # Shared API client
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── types/                        # Shared TypeScript types
│       ├── src/
│       │   └── index.ts
│       └── package.json
│
├── services/                         # Backend services
│   └── api/                         # Express API server (Render)
│       ├── src/
│       │   ├── app.ts               # Express app setup
│       │   ├── server.ts            # Server entry point
│       │   │
│       │   ├── config/              # Configuration
│       │   │   ├── database.ts
│       │   │   ├── env.ts
│       │   │   └── supabase.ts
│       │   │
│       │   ├── middleware/          # Express middleware
│       │   │   ├── cors.ts
│       │   │   ├── errorHandler.ts
│       │   │   ├── logger.ts
│       │   │   └── validator.ts
│       │   │
│       │   ├── routes/              # API routes
│       │   │   ├── index.ts
│       │   │   ├── auth.routes.ts
│       │   │   └── health.routes.ts
│       │   │
│       │   ├── controllers/         # Route handlers
│       │   │   ├── auth.controller.ts
│       │   │   └── health.controller.ts
│       │   │
│       │   ├── services/            # Business logic
│       │   │   ├── auth.service.ts
│       │   │   ├── email.service.ts
│       │   │   └── token.service.ts
│       │   │
│       │   ├── repositories/        # Data access layer
│       │   │   ├── user.repository.ts
│       │   │   └── token.repository.ts
│       │   │
│       │   ├── utils/               # Utilities
│       │   │   ├── security.ts
│       │   │   └── logger.ts
│       │   │
│       │   └── types/               # TypeScript types
│       │       └── index.ts
│       │
│       ├── .env.example
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── database/                         # Database related files
│   ├── migrations/                  # Supabase migrations
│   │   └── *.sql
│   ├── seeds/                       # Seed data
│   │   └── seed.sql
│   └── config.toml                  # Supabase config
│
├── docs/                             # Documentation
│   ├── architecture/
│   │   └── ARCHITECTURE.md          # This file
│   ├── deployment/
│   │   ├── VERCEL_SETUP.md
│   │   └── RENDER_SETUP.md
│   ├── development/
│   │   └── SETUP.md
│   └── api/
│       └── API.md
│
├── scripts/                          # Utility scripts
│   ├── setup.sh
│   ├── migrate.sh
│   └── deploy.sh
│
├── tests/                            # E2E and integration tests
│   ├── e2e/
│   └── integration/
│
├── .gitignore
├── .env.example                      # Root env template
├── README.md
├── package.json                      # Root package.json (if monorepo)
├── pnpm-workspace.yaml               # or yarn/npm workspaces
└── turbo.json                        # Turborepo config (optional)

```

## Directory Explanations

### `/apps/web` - Frontend Application
**Purpose**: React + Vite frontend application deployed to Vercel

**Key Directories**:
- `src/features/` - Feature-based organization (auth, focus, planner, etc.)
  - Each feature is self-contained with components, hooks, pages, services, and types
- `src/shared/` - Reusable code across features
  - `components/ui/` - shadcn/ui component library
  - `contexts/` - React context providers
  - `hooks/` - Shared React hooks
  - `lib/` - Utility functions
  - `services/` - API clients (Supabase, REST API)
- `public/` - Static assets served directly

**Benefits**:
- Feature-based structure makes code easy to find and maintain
- Clear separation between features and shared code
- Scales well as features grow
- Easy to test and refactor individual features

### `/services/api` - Backend API Server
**Purpose**: Express.js API server deployed to Render

**Key Directories**:
- `src/config/` - Configuration files (database, environment, Supabase)
- `src/middleware/` - Express middleware (CORS, error handling, logging)
- `src/routes/` - API route definitions
- `src/controllers/` - Route handlers (request/response logic)
- `src/services/` - Business logic layer
- `src/repositories/` - Data access layer (database queries)
- `src/utils/` - Helper functions

**Architecture Pattern**: Layered Architecture
- Routes → Controllers → Services → Repositories
- Clear separation of concerns
- Easy to test each layer independently

### `/database` - Database Management
**Purpose**: Supabase migrations and database configuration

**Key Files**:
- `migrations/` - SQL migration files
- `seeds/` - Seed data for development
- `config.toml` - Supabase configuration

### `/apps/mobile` - Mobile Application
**Purpose**: Capacitor mobile app configuration

**Key Directories**:
- `android/` - Android native code
- `ios/` - iOS native code
- `capacitor.config.ts` - Capacitor configuration

### `/docs` - Documentation
**Purpose**: Centralized documentation

**Structure**:
- `architecture/` - System design docs
- `deployment/` - Deployment guides
- `development/` - Development setup
- `api/` - API documentation

### `/scripts` - Utility Scripts
**Purpose**: Automation scripts for common tasks

### Root Level
- Configuration files for tooling (ESLint, TypeScript, etc.)
- Root `package.json` for monorepo management (if using workspaces)
- `.env.example` templates

## Technology Stack Assumptions

### Frontend (`/apps/web`)
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **State Management**: React Context + TanStack Query
- **Routing**: React Router v6
- **Form Handling**: React Hook Form + Zod
- **Deployment**: Vercel

### Backend (`/services/api`)
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Email**: Postmark
- **Deployment**: Render

### Mobile (`/apps/mobile`)
- **Framework**: Capacitor
- **Platforms**: Android, iOS

## Migration Strategy

1. **Phase 1**: Create new structure alongside existing code
2. **Phase 2**: Move files incrementally, feature by feature
3. **Phase 3**: Update imports and configurations
4. **Phase 4**: Remove old structure
5. **Phase 5**: Update CI/CD and deployment configs

## Benefits of This Structure

✅ **Scalability**: Easy to add new features without cluttering
✅ **Maintainability**: Clear organization makes code easy to find
✅ **Team Collaboration**: Multiple developers can work on different features
✅ **Testability**: Clear separation makes unit and integration testing easier
✅ **Deployment Ready**: Separate apps/services ready for Vercel and Render
✅ **Professional**: Follows industry best practices used by major companies
✅ **Type Safety**: Shared types package ensures consistency
✅ **Monorepo Ready**: Can use Turborepo, Nx, or npm workspaces

