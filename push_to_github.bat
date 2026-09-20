@echo off
chcp 65001 >nul
echo ========================================================
echo   DANG DONG BO LEN GITHUB: alexermanh-creator...
echo ========================================================
git push -u origin main
git push -u origin main:master
echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   DA DAY CODE LEN GITHUB THANH CONG!
    echo ========================================================
) else (
    echo [!] Kiem tra lai ket noi hoac xac thuc GitHub.
)
pause
