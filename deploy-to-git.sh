#!/bin/bash

# BlayStorm Git Deployment Script
# This script helps you push your code to GitHub

echo "🚀 BlayStorm Git Deployment Helper"
echo "===================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null
then
    echo "❌ Git is not installed. Please install Git first:"
    echo "   https://git-scm.com/download/win"
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Check if this is already a git repository
if [ -d .git ]; then
    echo "✅ Git repository already initialized"
else
    echo "📝 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
fi

echo ""

# Check if .gitignore exists
if [ -f .gitignore ]; then
    echo "✅ .gitignore file exists"
else
    echo "⚠️  Creating .gitignore file..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Database
*.sqlite
*.db

# Prisma
packages/backend/prisma/migrations/

# Build files
*.tsbuildinfo
EOF
    echo "✅ .gitignore created"
fi

echo ""
echo "📦 Adding files to Git..."
git add .

echo ""
echo "📝 Creating commit..."
git commit -m "Initial commit - BlayStorm Phase 3 complete

- 18 backend services implemented
- 15 frontend engagement components
- 550+ math problems
- Boss battle system
- Treasure chest system
- Socket.io real-time features
- Complete API integration
- Comprehensive documentation"

echo ""
echo "✅ Commit created successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📌 NEXT STEPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Create a GitHub repository:"
echo "   → Go to https://github.com/new"
echo "   → Repository name: blaystorm"
echo "   → Choose Private or Public"
echo "   → DO NOT initialize with README"
echo "   → Click 'Create repository'"
echo ""
echo "2. Copy your repository URL from GitHub"
echo "   (It looks like: https://github.com/YOUR_USERNAME/blaystorm.git)"
echo ""
echo "3. Run these commands (replace YOUR_USERNAME):"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/blaystorm.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Your code is ready to push to GitHub!"
echo "   Follow the steps above to complete the push."
echo ""
