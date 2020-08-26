#!/bin/sh

cur_dir=$(pwd)
cd camagru
npm install
npm install mongoose
osascript -e 'tell app "Terminal"
    do script "cd '$cur_dir'/camagru/src/components/Server && node Server.js"
end tell'
HOST=0.0.0.0 npm start
