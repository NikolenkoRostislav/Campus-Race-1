#!/bin/bash

read -p "Room ID: " ROOM_ID

curl -b cookies.txt \
    -X POST http://localhost:3000/api/lobby/kick \
    -H "Content-Type: application/json" \
    -d "{\"roomID\":\"$ROOM_ID\"}"