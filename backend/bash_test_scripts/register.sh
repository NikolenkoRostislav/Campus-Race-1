#!/bin/bash

curl -i \
    -X POST "http://localhost:3000/api/register" \
    -H "Content-Type: application/json" \
    -d '{
        "login": "testuser",
        "password": "123456"
    }'


curl -i \
    -X POST "http://localhost:3000/api/register" \
    -H "Content-Type: application/json" \
    -d '{
        "login": "testuser2",
        "password": "123456"
    }'
