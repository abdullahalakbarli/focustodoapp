#!/bin/bash

# Backend Environment Setup Script
# This script helps you create a .env file for the backend server

echo "🔧 Focus Studio Backend Setup"
echo "=============================="
echo ""

# Check if .env already exists
if [ -f "../.env" ]; then
  echo "⚠️  .env file already exists!"
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

# Create .env file
cat > ../.env << EOF
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
echo "✅ .env file created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Review the .env file and make sure all values are correct"
echo "2. Run the database setup SQL in Supabase (see server/README.md)"
echo "3. Start the server: npm run server"
echo ""

