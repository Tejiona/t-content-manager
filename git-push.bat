@echo off
title T-Content Manager - Push to GitHub
color 0A
echo.
echo  ============================================
echo   T-Content Manager - Push GitHub
echo   TEJIONA AI Solutions
echo  ============================================
echo.

cd /d "%~dp0"

:: Init git
git init
git add .
git commit -m "Initial commit - T-Content Manager"
git branch -M main
git remote add origin https://github.com/Tejiona/t-content-manager.git
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo  ============================================
    echo   Push reussi ! Repo: github.com/Tejiona/t-content-manager
    echo  ============================================
) else (
    echo  ERREUR: Le push a echoue.
    echo  Si authentification requise, executez:
    echo    gh auth login
    echo  ou utilisez un Personal Access Token.
)
echo.
pause
