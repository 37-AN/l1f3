#!/bin/bash
# Render.com deployment fix for chromadb platform issues

set -e

echo "🔧 Fixing Render deployment - removing platform-specific dependencies..."

# Create a clean backend-only directory for deployment
DEPLOY_DIR="backend-deploy"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

echo "📦 Copying backend files (excluding problematic dependencies)..."

# Copy backend source files
cp -r backend/src $DEPLOY_DIR/
cp -r backend/test $DEPLOY_DIR/ 2>/dev/null || true
cp backend/package.json $DEPLOY_DIR/
cp backend/tsconfig*.json $DEPLOY_DIR/ 2>/dev/null || true
cp backend/nest-cli.json $DEPLOY_DIR/ 2>/dev/null || true
cp backend/jest.config.js $DEPLOY_DIR/ 2>/dev/null || true

# Create a clean package.json without chromadb
cat > $DEPLOY_DIR/package.json << 'EOF'
{
  "name": "@lif3/backend",
  "version": "1.0.0",
  "description": "LIF3 Backend API - NestJS + TypeScript + PostgreSQL",
  "private": true,
  "main": "dist/main.js",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:prod": "node dist/main",
    "typeorm": "typeorm-ts-node-commonjs"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.17.0",
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.1.1",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.2",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/platform-socket.io": "^10.3.0",
    "@nestjs/schedule": "^4.1.2",
    "@nestjs/swagger": "^7.1.16",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/websockets": "^10.3.0",
    "@types/multer": "^2.0.0",
    "bcryptjs": "^2.4.3",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "compression": "^1.7.4",
    "discord.js": "^14.14.1",
    "express-rate-limit": "^7.1.5",
    "googleapis": "^128.0.0",
    "helmet": "^7.1.0",
    "ioredis": "^5.3.2",
    "multer": "^2.0.1",
    "nest-winston": "^1.9.4",
    "nodemailer": "^6.9.7",
    "passport": "^0.6.0",
    "passport-google-oauth20": "^2.0.0",
    "passport-jwt": "^4.0.1",
    "pg": "^8.11.3",
    "redis": "^4.6.11",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "socket.io": "^4.7.4",
    "typeorm": "^0.3.17",
    "uuid": "^9.0.1",
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/compression": "^1.7.5",
    "@types/express": "^4.17.17",
    "@types/node": "^20.3.1",
    "@types/nodemailer": "^6.4.14",
    "@types/passport-google-oauth20": "^2.0.14",
    "@types/passport-jwt": "^3.0.13",
    "@types/uuid": "^9.0.7",
    "typescript": "^5.1.3"
  }
}
EOF

echo "✅ Created clean backend deployment package"
echo "📁 Deploy directory: $DEPLOY_DIR"
echo ""
echo "🚀 Manual deployment steps:"
echo "1. Zip the $DEPLOY_DIR folder"
echo "2. Upload to Render.com as manual deploy"
echo "3. Or create new GitHub repo with just the $DEPLOY_DIR contents"
echo ""
echo "🎯 This package excludes chromadb and other platform-specific dependencies"