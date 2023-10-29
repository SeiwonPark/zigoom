FROM --platform=linux/amd64 mongo:latest

COPY ./mongod.conf /etc/mongod.conf
