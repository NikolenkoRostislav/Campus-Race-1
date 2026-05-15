#!/bin/bash

curl -i -c cookies.txt \
    -X POST "http://localhost:3000/api/login" \
    -H "Content-Type: application/json" \
    -d '{
        "login": "testuser",
        "password": "123456"
    }'
