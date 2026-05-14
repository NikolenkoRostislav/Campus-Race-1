#!/bin/bash

curl -b cookies.txt \
    -X POST http://localhost:3000/api/lobby/kick \
    -H "Content-Type: application/json" \
    -d '{
        "roomID": "ROOM_ID_HERE"
    }'