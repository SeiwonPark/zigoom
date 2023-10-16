#!/bin/bash

reset='\033[0m'
red='\033[0;31m'
yellow='\033[0;33m'
green='\033[0;32m'
blue='\033[34m'

function check_redis {
    redis-cli PING > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "${green}✔${reset} Redis is running."
    else
        echo "${red}✘${reset} Failed to connect to Redis."
    fi
}

function check_mongo {
    pgrep mongo > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "${green}✔${reset} MongoDB is running."
    else
        echo "${red}✘${reset} Failed to connect to MongoDB."
    fi
}

function check_mysql {
    pgrep mysql > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "${green}✔${reset} MySQL is running."
    else
        echo "${red}✘${reset} Failed to connect to MySQL."
    fi
}

function check_docker {
    docker version > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "${green}✔${reset} Docker is running."
    else
        echo "${red}✘${reset} Failed to connect to Docker."
    fi
}

check_redis &
check_mongo &
check_mysql &
check_docker &

wait
