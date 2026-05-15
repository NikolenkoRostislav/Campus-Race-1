#!/bin/bash

curl -b cookies.txt \
    "http://localhost:3000/api/me"
