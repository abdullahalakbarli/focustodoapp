# FocusTodo App

A professional focus and productivity application with timer, task planning, and gamification features.

## 🏗️ Project Structure

This project follows a professional, scalable architecture:

```
focustodoapp/
├── apps/
│   ├── web/          # Frontend React app (Vercel)
│   └── mobile/       # Mobile app (Capacitor)
├── services/
│   └── api/          # Backend API (Render)
├── database/         # Database migrations
├── docs/             # Documentation
└── scripts/          # Utility scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Supabase account
- Postmark account (for email)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd focustodoapp
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   
   Frontend (`apps/web/.env`):
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   VITE_API_BASE_URL=http://localhost:4000
   ```
   
   Backend (`services/api/.env`):
   ```env
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=your-database-url
   POSTMARK_API_TOKEN=your-postmark-token
   FROM_EMAIL=noreply@yourdomain.com
   FROM_NAME=Focus Studio
   FRONTEND_URL=http://localhost:5173
   PORT=4000
   ```

4. **Run development servers**
   ```bash
   # Run both frontend and backend
   npm run dev
   
   # Or run separately:
   npm run dev:web    # Frontend on http://localhost:5173
   npm run dev:api    # Backend on http://localhost:4000
   ```

## 📦 Available Scripts

### Root Level
- `npm run dev` - Run both frontend and backend
- `npm run build` - Build both apps
- `npm run install:all` - Install all dependencies

### Frontend (`apps/web`)
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend (`services/api`)
- `npm run dev` - Start dev server with watch
- `npm start` - Start production server

## 🌐 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set root directory to `apps/web`
3. Vercel will auto-detect Vite configuration
4. Add environment variables in Vercel dashboard

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set root directory to `services/api`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables in Render dashboard

## 📚 Documentation

- [Architecture](./docs/architecture/ARCHITECTURE.md) - Complete architecture design
- [Migration Guide](./docs/development/MIGRATION_GUIDE.md) - Migration instructions
- [Deployment](./docs/deployment/) - Deployment guides
- [API Documentation](./docs/api/) - API endpoints

## 🛠️ Technology Stack

### Frontend
- React 18 + TypeScript
- Vite
- shadcn/ui + Tailwind CSS
- React Router v6
- TanStack Query
- Supabase Client

### Backend
- Node.js 20+
- Express.js
- TypeScript
- Supabase (PostgreSQL)
- Postmark (Email)

### Mobile
- Capacitor
- Android & iOS

## 📝 License

Private project

## 🤝 Contributing

This is a private project. For questions or issues, please contact the maintainer.

