@echo off
title T-Content Manager - Deploiement Vercel
color 0A
echo.
echo  ============================================
echo   T-Content Manager - Deploiement
echo   TEJIONA AI Solutions
echo  ============================================
echo.

cd /d "%~dp0"

:: --- Prerequis ---
echo [0/5] Verification des prerequis...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Node.js n'est pas installe.
    echo Installez-le depuis https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do echo    Node.js %%v OK

where npx >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: npm/npx non trouve.
    pause
    exit /b 1
)
echo    npm OK

:: Verifier Vercel CLI
call npx vercel --version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo    Vercel CLI non trouve, installation...
    call npm install -g vercel
)
echo    Vercel CLI OK
echo.

:: --- Etape 1 ---
echo [1/5] Installation des dependances npm...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: npm install a echoue. Verifiez votre connexion.
    pause
    exit /b 1
)
echo    OK
echo.

:: --- Etape 2 ---
echo [2/5] Liaison avec le projet Vercel...
echo    Repondez aux questions si c'est la premiere fois.
call npx vercel link
echo    OK
echo.

:: --- Etape 3 ---
echo [3/5] Recuperation des variables d'environnement depuis Vercel...
call npx vercel env pull .env.local
echo    OK
echo.

:: --- Etape 4 ---
echo [4/5] Generation du client Prisma + migration DB...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo AVERTISSEMENT: prisma generate a echoue.
    echo    Verifiez que @prisma/client est bien installe.
)

call npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo AVERTISSEMENT: prisma db push a echoue.
    echo    Causes possibles :
    echo    - Vercel Postgres pas encore ajoute au projet
    echo    - Variables DATABASE_URL / DIRECT_URL manquantes
    echo.
    echo    Pour ajouter Postgres :
    echo    1. Allez sur vercel.com/dashboard
    echo    2. Ouvrez votre projet T-Content-Manager
    echo    3. Storage ^> Create Database ^> Postgres
    echo    4. Relancez ce script
    echo.
    set /p CONTINUE="Continuer quand meme ? (o/n): "
    if /i not "!CONTINUE!"=="o" (
        pause
        exit /b 1
    )
)
echo    OK
echo.

:: --- Etape 5 ---
echo  ============================================
echo   Tout est pret pour le deploiement !
echo  ============================================
echo.
set /p DEPLOY="[5/5] Deployer en production maintenant ? (o/n): "
if /i "%DEPLOY%"=="o" (
    echo.
    echo Deploiement en cours sur Vercel...
    echo Cela peut prendre 1-2 minutes...
    echo.
    call npx vercel --prod
    echo.
    echo  ============================================
    echo   Deploiement termine !
    echo   Votre app est en ligne.
    echo  ============================================
) else (
    echo.
    echo Pour deployer plus tard :
    echo    cd T-Content-Manager
    echo    npx vercel --prod
)

echo.
echo  Commandes utiles :
echo    npm run dev          - Lancer en local (http://localhost:3000)
echo    npx prisma studio    - Explorer la base de donnees
echo    npx vercel logs      - Voir les logs de production
echo.
pause
