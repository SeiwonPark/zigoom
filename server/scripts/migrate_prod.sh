#!/bin/bash

reset='\033[0m'
red='\033[0;31m'
yellow='\033[0;33m'
green='\033[0;32m'

echo "${yellow}[INFO]${reset} Migrating prod..."
pnpm prisma migrate deploy --schema=./prisma/mysql/schema.prisma --name $1  && \
pnpm prisma generate --schema=./prisma/mysql/schema.prisma
