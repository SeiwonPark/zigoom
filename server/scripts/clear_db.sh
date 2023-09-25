#!/bin/bash

reset='\033[0m'
red='\033[0;31m'
yellow='\033[0;33m'
green='\033[0;32m'
blue='\033[34m'

echo "${yellow}[WARN]${reset} Clear database."
read -p "Do you want to continue? [y/n] ? " -r ARG

if [[ $ARG =~ ^[Yy]$ ]]; then
    echo "\n[INFO] Clearing database..."
    pnpm prisma migrate reset --schema=./prisma/mysql/schema.prisma
    echo "${green}Successfully cleared database."
else
    echo "\nTerminate process."
    exit
fi