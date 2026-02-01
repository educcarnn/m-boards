#!/bin/sh
set -e

echo "Running prisma generate..."
npx prisma generate

echo "Running prisma migrate dev..."
npx prisma migrate dev --skip-generate

echo "Starting NestJS..."
exec npm run dev
