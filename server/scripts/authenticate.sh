#!/bin/bash

reset='\033[0m'
red='\033[0;31m'
green='\033[0;32m'
blue='\033[34m'

function check_docker {
    echo "\n${green}Checking docker process...${reset}\n"
    docker version > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "${green}✔${reset} Docker is running."
    else
        echo "${red}✘${reset} Failed to connect to Docker."
        exit
    fi
}

source ../.env
check_docker
docker logout public.ecr.aws
aws ecr get-login-password --region $AWS_REGION --profile $AWS_PROFILE | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
