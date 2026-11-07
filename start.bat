@echo off
cd /d "%~dp0"
set PORT=%1
if "%PORT%"=="" set PORT=8080
echo LOOPS Spatial Store: http://localhost:%PORT%
echo Demo sequence: http://localhost:%PORT%/?demo=1
py -m http.server %PORT%
