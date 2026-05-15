#!/bin/bash

read -p "Room ID: " ROOM_ID
read -p "X: " X

curl -b cookies.txt -X POST http://localhost:3000/api/game/sacrifice \
    -H "Content-Type: application/json" \
    -d "{\"roomID\":\"$ROOM_ID\", \"x\": $X}"