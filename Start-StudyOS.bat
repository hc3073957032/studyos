@echo off
cd /d "%~dp0"
title StudyOS
set "NODE_EXE=D:\node.exe"
if exist "%NODE_EXE%" (
  "%NODE_EXE%" scripts\\dev.mjs
) else (
  node scripts\\dev.mjs
)
pause
