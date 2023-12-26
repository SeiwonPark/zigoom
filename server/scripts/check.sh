#!/bin/bash

reset='\033[0m'
red='\033[0;31m'
yellow='\033[0;33m'
green='\033[0;32m'
blue='\033[34m'

function check_redis {
    redis-cli PING > /dev/null 2>&1
    return $?
}

function check_mongo {
    pgrep mongo > /dev/null 2>&1
    return $?
}

function check_mysql {
    pgrep mysql > /dev/null 2>&1
    return $?
}

function check_docker {
    docker version > /dev/null 2>&1
    return $?
}

check_redis &
redis_pid=$!
check_mongo &
mongo_pid=$!
check_mysql &
mysql_pid=$!
check_docker &
docker_pid=$!

wait $redis_pid
redis_status=$?
wait $mongo_pid
mongo_status=$?
wait $mysql_pid
mysql_status=$?
wait $docker_pid
docker_status=$?


if [ $redis_status -eq 0 ]; then
    echo "${green}✔${reset} Redis is running."
else
    echo "${red}✘${reset} Failed to connect to Redis."
    exit 1
fi

if [ $mongo_status -eq 0 ]; then
    echo "${green}✔${reset} MongoDB is running."
else
    echo "${red}✘${reset} Failed to connect to MongoDB."
    exit 1
fi

if [ $mysql_status -eq 0 ]; then
    echo "${green}✔${reset} MySQL is running."
else
    echo "${red}✘${reset} Failed to connect to MySQL."
    exit 1
fi

if [ $docker_status -eq 0 ]; then
    echo "${green}✔${reset} Docker is running."
else
    echo "${red}✘${reset} Failed to connect to Docker."
    exit 1
fi
