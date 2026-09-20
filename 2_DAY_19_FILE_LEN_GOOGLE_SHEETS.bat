@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================================
echo   DANG DAY TOAN BO 19 FILE RIENG BIET LEN GOOGLE APPS SCRIPT...
echo   Ma du an: 1gh2JeFuQ106ksrpPuXAB0U1lCafpqkXyYnXnEPKBvkRsOQdT2ap70wpZ
echo ========================================================
call ".tools\node-v20.18.0-win-x64\clasp.cmd" push -f

if errorlevel 1 goto LOI_XAY_RA

echo ========================================================
echo   CHUC MUNG! TOAN BO 19 FILE DA DUOC DAY LEN GOOGLE SHEETS!
echo   Ban chi can quay lai Apps Script va bam F5 de xem.
echo ========================================================
goto KET_THUC

:LOI_XAY_RA
echo ========================================================
echo   DA XAY RA LOI KHI DAY LEN GOOGLE!
echo ========================================================
echo [HUONG DAN XU LY NHANH]:
echo 1. Neu thong bao loi Google Apps Script API:
echo    - Truy cap: https://script.google.com/home/usersettings
echo    - Gat muc Google Apps Script API sang ON
echo 2. Neu thong bao No credentials found hoac loi dang nhap:
echo    - Chay lai file "1_DANG_NHAP_GOOGLE.bat" de dang nhap lai Google.
echo 3. Sau do chay lai file nay.
echo ========================================================

:KET_THUC
echo.
pause

