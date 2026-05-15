#!/bin/bash

read -p "Room ID: " ROOM_ID

curl -b cookies.txt "http://localhost:3000/api/game/hand?roomID=$ROOM_ID" 