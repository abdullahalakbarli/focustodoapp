# FocusTodo App - Visual Folder Structure

## Complete Directory Tree

```
focustodoapp/
│
├── 📁 .github/
│   └── workflows/              # CI/CD pipelines
│
├── 📁 apps/                   # Application layer
│   │
│   ├── 📁 web/               # Frontend (Vercel)
│   │   ├── 📁 public/        # Static assets
│   │   ├── 📁 src/
│   │   │   ├── 📁 app/       # App config & routes
│   │   │   ├── 📁 features/  # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   ├── focus/
│   │   │   │   ├── planner/
│   │   │   │   ├── reports/
│   │   │   │   ├── profile/
│   │   │   │   ├── leaderboard/
│   │   │   │   └── admin/
│   │   │   └── 📁 shared/    # Shared code
│   │   │       ├── components/
│   │   │       ├── contexts/
│   │   │       ├── hooks/
│   │   │       ├── lib/
│   │   │       ├── services/
│   │   │       └── types/
│   │   ├── index.html
│   │   └── package.json
│   │
│   └── 📁 mobile/            # Mobile app (Capacitor)
│       ├── android/
│       ├── ios/
│       └── capacitor.config.ts
│
├── 📁 services/              # Backend services
│   └── 📁 api/               # Express API (Render)
│       └── 📁 src/
│           ├── config/
│           ├── middleware/
│           ├── routes/
│           ├── controllers/
│           ├── services/
│           ├── repositories/
│           └── utils/
│
├── 📁 database/              # Database files
│   ├── migrations/
│   └── seeds/
│
├── 📁 docs/                  # Documentation
│   ├── architecture/
│   ├── deployment/
│   ├── development/
│   └── api/
│
├── 📁 scripts/               # Utility scripts
│
└── 📄 Configuration files    # Root level configs
```

## Feature Structure Example (Focus Feature)

```
features/focus/
├── 📁 components/           # Feature-specific components
│   ├── TimerDisplay.tsx
│   ├── CategorySelector.tsx
│   └── CustomCategoryDialog.tsx
│
├── 📁 hooks/                # Feature-specific hooks
│   └── useFocus.ts
│
├── 📁 pages/                # Feature pages
│   └── FocusPage.tsx
│
├── 📁 services/             # Feature API calls
│   └── focusService.ts
│
└── 📁 types/                # Feature TypeScript types
    └── focus.types.ts
```

## Backend Structure Example

```
services/api/src/
├── 📁 config/                # Configuration
│   ├── database.ts
│   ├── env.ts
│   └── supabase.ts
│
├── 📁 middleware/           # Express middleware
│   ├── cors.ts
│   ├── errorHandler.ts
│   └── logger.ts
│
├── 📁 routes/               # Route definitions
│   ├── index.ts
│   └── auth.routes.ts
│
├── 📁 controllers/          # Request handlers
│   └── auth.controller.ts
│
├── 📁 services/             # Business logic
│   ├── auth.service.ts
│   └── email.service.ts
│
├── 📁 repositories/         # Data access
│   └── user.repository.ts
│
└── 📁 utils/                # Utilities
    └── security.ts
```

## Key Principles

### 1. Feature-Based Frontend
- Each feature is self-contained
- Easy to find related code
- Scales with team growth

### 2. Layered Backend
- Clear separation of concerns
- Easy to test and maintain
- Follows SOLID principles

### 3. Shared Code
- Reusable across features
- Single source of truth
- Prevents duplication

### 4. Clear Separation
- Frontend and backend separate
- Mobile app separate
- Database migrations separate

## File Naming Conventions

### Components
- PascalCase: `TimerDisplay.tsx`
- Descriptive names: `CategorySelector.tsx`

### Hooks
- camelCase with `use` prefix: `useFocus.ts`, `useAuth.ts`

### Services
- camelCase with `Service` suffix: `authService.ts`, `emailService.ts`

### Types
- camelCase with `.types.ts` suffix: `auth.types.ts`, `focus.types.ts`

### Pages
- PascalCase with `Page` suffix: `FocusPage.tsx`, `LoginPage.tsx`

### Controllers
- camelCase with `Controller` suffix: `auth.controller.ts`

### Routes
- camelCase with `Routes` suffix: `auth.routes.ts`

