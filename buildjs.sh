#!/bin/bash

echo "vulcanize &"
vulcanize -o public/imports.html public/components.html &
echo "browserify"
browserify . -d -o public/js/civmap.js