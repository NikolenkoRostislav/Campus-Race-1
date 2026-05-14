#!/bin/bash

read -p "Room ID: " ROOM_ID
read -p "Random draw? (y/n): " IS_RANDOM

if [[ "$IS_RANDOM" == "y" || "$IS_RANDOM" == "Y" ]]; then
    RANDOM_VALUE=true
else
    RANDOM_VALUE=false
fi

curl -b cookies.txt -X POST http://localhost:3000/api/game/draw \
    -H "Content-Type: application/json" \
    -d "{\"roomID\":\"$ROOM_ID\", \"random\": $RANDOM_VALUE}"