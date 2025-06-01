#!/bin/bash
set -e
echo "Starting build process..."
cd /var/app/staging

# タイムアウト対策でより軽量なインストール
echo "Installing dependencies..."
npm ci --production=false --silent

echo "Building application..."
NODE_ENV=production npm run build

echo "Build completed successfully"