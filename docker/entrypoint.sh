#!/bin/sh
set -e

if [ ! -d node_modules/.bin ]; then
  npm install
fi

exec npm run dev -- --host 0.0.0.0
