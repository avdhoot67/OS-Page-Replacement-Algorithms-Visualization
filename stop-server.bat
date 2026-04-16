@echo off
echo Stopping all Node.js servers...
taskkill /F /IM node.exe
echo.
echo All Node.js processes have been terminated.
echo.
pause 