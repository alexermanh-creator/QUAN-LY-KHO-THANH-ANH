@echo off
chcp 65001 >nul
echo ========================================================
echo   DANG DAY TOAN BO 19 FILE RIENG BIET LEN GOOGLE APPS SCRIPT...
echo   Ma du an: 1n7XmeVoZFUr_OWjUW8qwL1avBtObMK3nQwGgbWUIDbfeX5pZIDsq-_Rl
echo ========================================================
".tools\node-v20.18.0-win-x64\clasp.cmd" push -f
echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   CHUC MUNG! TOAN BO 19 FILE DA DUC DAY LEN GOOGLE SHEETS!
    echo   Ban chi can quay lai Apps Script va bam F5 de xem.
    echo ========================================================
) else (
    echo.
    echo [CHU Y] Neu bao loi: "Google Apps Script API has not been used...":
    echo 1. Hay vao: https://script.google.com/home/usersettings
    echo 2. Bat muc "Google Apps Script API" sang ON.
    echo 3. Chay lai file nay!
)
pause
