#!/bin/bash

read -p "Room ID: " ROOM_ID

curl -b cookies.txt -X POST http://localhost:3000/api/game/end-place \
    -H "Content-Type: application/json" \
    -d "{\"roomID\":\"$ROOM_ID\"}"