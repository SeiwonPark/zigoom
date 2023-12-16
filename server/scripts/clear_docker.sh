#!/bin/bash 

reset='\033[0m'
red='\033[0;31m'
yellow='\033[0;33m'
green='\033[0;32m'
blue='\033[34m'

echo "${yellow}[WARN]${reset} Removing all docker resources..."
read -p "Do you want to continue? [y/n] ? " -r ARG

if [[ $ARG =~ ^[Yy]$ ]]; then
  [ $(docker ps | wc -l) -ne 1 ] && \
  echo "\n[INFO] Stopping containers..." && \
  docker stop $(docker ps -aq)

  [ $(docker ps -a | wc -l) -ne 1 ] && \
  echo "\n[INFO] Removing containers..." && \
  docker rm $(docker ps -aq)

  [ $(docker images | wc -l) -ne 1 ] && \
  echo "\n[INFO] Removing images..." && \
  docker rmi $(docker images -aq)
  docker rmi $(docker images -f "dangling=true" -q) -f
  
  [ $(docker volume ls | wc -l) -ne 1 ] && \
  echo "\n[INFO] Removing volumes..." && \
  docker volume rm $(docker volume ls -q)
  
  echo "${green}Successfully cleared docker resources."
else
  echo "\nTerminated process.\n\n"
fi

exit