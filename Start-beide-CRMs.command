#!/bin/zsh
cd "$(dirname "$0")" || exit 1
node scripts/local-launch.mjs --open
