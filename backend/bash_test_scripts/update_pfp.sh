#!/bin/bash

read -p "PFP URL: " PFP_URL

curl -b cookies.txt \
    -X PATCH http://localhost:3000/api/user/pfp_url \
    -H "Content-Type: application/json" \
    -d "{\"pfp_url\":\"$PFP_URL\"}"