#!/bin/bash

curl -i -c cookies.txt \
    -X POST "http://localhost:3000/api/login" \
    -H "Content-Type: application/json" \
    -d '{
        "login": "testuser2",
        "password": "123456"
    }'
