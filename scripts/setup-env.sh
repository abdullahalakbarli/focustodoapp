#!/bin/bash

# Backend Environment Setup Script
# This script helps you create a .env file for the backend server

echo "🔧 Focus Studio Backend Setup"
echo "=============================="
echo ""

ENV_FILE="../services/api/.env"

# Check if .env already exists
if [ -f "$ENV_FILE" ]; then
  echo "⚠️  $ENV_FILE already exists!"
  read -p "Do you want to overwrite it? (y/N): " overwrite
  if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
    echo "Cancelled."
    exit 0
  fi
fi

echo "Please provide the following information:"
echo ""

# Supabase URL
read -p "Supabase URL (e.g., https://xxxxx.supabase.co): " SUPABASE_URL
if [ -z "$SUPABASE_URL" ]; then
  echo "❌ Supabase URL is required!"
  exit 1
fi

# Supabase Service Role Key
read -p "Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Supabase Service Role Key is required!"
  exit 1
fi

# Database URL
read -p "Database URL (PostgreSQL connection string): " DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Database URL is required!"
  exit 1
fi

# SendGrid API Key
read -p "SendGrid API Key (or press Enter to skip): " SENDGRID_API_KEY

# From Email
read -p "From Email (e.g., noreply@yourdomain.com) [default: noreply@focusstudio.app]: " FROM_EMAIL
FROM_EMAIL=${FROM_EMAIL:-noreply@focusstudio.app}

# From Name
read -p "From Name [default: Focus Studio]: " FROM_NAME
FROM_NAME=${FROM_NAME:-Focus Studio}

# Frontend URL
read -p "Frontend URL [default: http://localhost:5173]: " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-http://localhost:5173}

# Port
read -p "Server Port [default: 4000]: " PORT
PORT=${PORT:-4000}

mkdir -p "$(dirname "$ENV_FILE")"

# Create .env file
cat > "$ENV_FILE" << EOF
# Supabase Configuration
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# Database Connection (PostgreSQL - Supabase)
DATABASE_URL=$DATABASE_URL

# Email Service (SendGrid)
SENDGRID_API_KEY=$SENDGRID_API_KEY
FROM_EMAIL=$FROM_EMAIL
FROM_NAME=$FROM_NAME

# Frontend URL (for email links)
FRONTEND_URL=$FRONTEND_URL

# Server Port
PORT=$PORT
EOF

echo ""
echo "✅ $ENV_FILE created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Review $ENV_FILE and make sure all values are correct"
echo "2. Copy apps/web/.env.example to apps/web/.env and add your Supabase anon key"
echo "3. Run the database setup SQL in Supabase (see services/api/README.md)"
echo "4. Start the stack: npm run dev"
echo ""

