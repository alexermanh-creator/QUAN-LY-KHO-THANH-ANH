@echo off
chcp 65001 >nul
echo ========================================================
echo   DANG DAY TOAN BO 19 FILE RIENG BIET LEN GOOGLE APPS SCRIPT...
echo   Ma du an: 1gh2JeFuQ106ksrpPuXAB0U1lCafpqkXyYnXnEPKBvkRsOQdT2ap70wpZ
echo ========================================================
".tools\node-v20.18.0-win-x64\clasp.cmd" push -f
echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   CHUC MUNG! TOAN BO 19 FILE DA DUOC DAY LEN GOOGLE SHEETS!
    echo   Ban chi can quay lai Apps Script va bam F5 de xem.
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo [HUONG DAN XU LY NEU GAP LOI]
    echo 1. Neu loi chua bat API: Truy cap https://script.google.com/home/usersettings va bat "Google Apps Script API" sang ON.
    echo 2. Neu loi het han dang nhap: Chay lai file "1_DANG_NHAP_GOOGLE.bat" de dang nhap lai tai khoan Google.
    echo 3. Sau do chay lai file nay de day toan bo 19 file len.
    echo ========================================================
)
pause
