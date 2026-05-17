#!/bin/bash

echo " Logging in as creator..."

curl -s -i -c cookies.txt \
    -X POST http://localhost:3000/api/login \
    -H "Content-Type: application/json" \
    -d '{
        "login": "testuser",
        "password": "123456"
    }'

echo -e "\n Creating lobby..."

ROOM_ID=$(curl -s -b cookies.txt \
    -X POST http://localhost:3000/api/lobby/new \
    | sed -E 's/.*"roomID":"([^"]+)".*/\1/')

echo "Room ID: $ROOM_ID"

echo -e "\n Setting creator ready..."

curl -s -b cookies.txt \
    -X POST http://localhost:3000/api/lobby/ready \
    -H "Content-Type: application/json" \
    -d "{\"roomID\":\"$ROOM_ID\"}"

echo -e "\n Logging out creator..."

curl -s -b cookies.txt \
    -X POST http://localhost:3000/api/logout

echo -e "\n Logging in as opponent..."

curl -s -i -c cookies.txt \
    -X POST http://localhost:3000/api/login \
    -H "Content-Type: application/json" \
    -d '{
        "login": "testuser2",
        "password": "123456"
    }'

echo -e "\n Joining lobby..."

curl -s -b cookies.txt \
    -X POST http://localhost:3000/api/lobby/join \
    -H "Content-Type: application/json" \
    -d "{\"roomID\":\"$ROOM_ID\"}"

echo -e "\n Setting opponent ready..."

curl -s -b cookies.txt \
    -X POST http://localhost:3000/api/lobby/ready \
    -H "Content-Type: application/json" \
    -d "{\"roomID\":\"$ROOM_ID\"}"

echo -e "\n Logging out opponent..."

curl -s -b cookies.txt \
    -X POST http://localhost:3000/api/logout

echo -e "\n Logging back in as creator..."

curl -s -i -c cookies.txt \
    -X POST http://localhost:3000/api/login \
    -H "Content-Type: application/json" \
    -d '{
        "login": "testuser",
        "password": "123456"
    }'

echo -e "\n Starting game..."

curl -s -b cookies.txt \
    -X POST http://localhost:3000/api/game/start \
    -H "Content-Type: application/json" \
    -d "{\"roomID\":\"$ROOM_ID\"}" 

echo -e "\n Game setup complete. The room id is $ROOM_ID"