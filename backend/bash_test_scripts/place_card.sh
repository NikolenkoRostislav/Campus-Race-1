#!/bin/bash

read -p "Room ID: " ROOM_ID
read -p "X: " X
read -p "Card ID: " CARD_ID

curl -b cookies.txt -X POST http://localhost:3000/api/game/place \
    -H "Content-Type: application/json" \
    -d "{\"roomID\":\"$ROOM_ID\", \"x\": $X, \"cardID\":\"$CARD_ID\"}"