#!/bin/bash

echo "vulcanize &"
./node_modules/vulcanize/bin/vulcanize -o public/imports.html public/components.html &
echo "browserify"
./node_modules/browserify/bin/cmd.js . -d -o public/js/civmap.js
