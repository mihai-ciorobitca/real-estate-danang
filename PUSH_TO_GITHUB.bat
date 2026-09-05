@echo off
setlocal
title Da Nang Real Estate - Push to GitHub
cd /d "%~dp0"

where git >nul 2>&1
if errorlevel 1 (
  echo Git is not installed or not available in PATH.
  echo Install Git for Windows, then run this file again.
  pause
  exit /b 1
)

echo.
echo Create an EMPTY GitHub repository first.
set /p "REPO_URL=Paste its HTTPS repository URL here: "
if not defined REPO_URL (
  echo No repository URL was entered.
  pause
  exit /b 1
)

git init
if errorlevel 1 goto :failed

git add -A
if errorlevel 1 goto :failed

git commit -m "Initial Da Nang Real Estate website"
if errorlevel 1 (
  echo.
  echo Git may need your name and email before it can create a commit.
  echo Run these two commands in Git Bash and start this file again:
  echo   git config --global user.name "Your Name"
  echo   git config --global user.email "you@example.com"
  pause
  exit /b 1
)

git branch -M main
git remote remove origin >nul 2>&1
git remote add origin "%REPO_URL%"
if errorlevel 1 goto :failed

git push -u origin main
if errorlevel 1 goto :failed

echo.
echo SUCCESS - The complete website was pushed to GitHub.
pause
exit /b 0

:failed
echo.
echo The push did not finish. Read the Git message above, then try again.
pause
exit /b 1
