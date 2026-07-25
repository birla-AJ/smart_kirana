#!/usr/bin/env bash
# Nimad Kirana backend — EC2 deploy/update script.
# Run this ON the EC2 instance, from inside the repo folder, every time
# you want to pull and deploy the latest backend code.
#
# First-time setup (Node, PM2, Nginx, Docker) is in docs/DESCRIPTION.md —
# run that once before using this script.

set -e

echo "==> Pulling latest code"
git pull origin main

echo "==> Installing backend dependencies"
cd backend
npm install

echo "==> Generating Prisma client"
npx prisma generate

echo "==> Applying database migrations"
npx prisma migrate deploy

echo "==> Building backend"
npm run build

echo "==> Reloading PM2 process"
pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js

echo "==> Saving PM2 process list"
pm2 save

echo "✅ Deploy complete. Check status with: pm2 status"
