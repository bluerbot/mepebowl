@echo off
echo Starting local web server for the Bowling Game...
echo.
echo Your browser will open automatically.
echo Please leave this window open while playing!
echo.
start http://localhost:8000/game/html/init.html?v=12
python -m http.server 8000
