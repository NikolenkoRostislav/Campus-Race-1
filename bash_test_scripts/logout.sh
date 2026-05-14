#!/bin/bash

curl -b cookies.txt \
    -X POST "http://localhost:3000/api/logout"
