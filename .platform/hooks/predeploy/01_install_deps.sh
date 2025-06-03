#!/bin/bash
cd /var/app/staging

# Clear npm cache
npm cache clean --force

# Install all dependencies (including devDependencies for build)
npm install --production=false

# Generate Prisma client
npm run prisma:generate

# Build the Next.js application
npm run build

# Clean up devDependencies after build
npm prune --production