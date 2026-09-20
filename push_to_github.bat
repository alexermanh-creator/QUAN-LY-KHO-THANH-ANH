@echo off
chcp 65001 >nul
echo ========================================================
echo   DANG DAY CODE LEN GITHUB: alexermanh-creator...
echo ========================================================
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   DA DAY CODE LEN GITHUB THANH CONG!
    echo   Ban hay vao Apps Script va bam nut PULL.
    echo ========================================================
) else (
    echo [!] Co loi xay ra khi day code. Vui long kiem tra dang nhap GitHub.
)
pause
