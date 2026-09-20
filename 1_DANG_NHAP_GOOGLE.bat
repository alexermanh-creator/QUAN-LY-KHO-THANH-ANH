@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================================
echo   DANG KET NOI VA XAC THUC VOI TAI KHOAN GOOGLE...
echo   Trinh duyet se tu dong mo len.
echo   Ban chi can chon tai khoan Google va bam "Cho phep" (Allow).
echo ========================================================
call ".tools\node-v20.18.0-win-x64\clasp.cmd" login
echo.
echo ========================================================
echo   DA HOAN TAT! Nhan phim bat ky de dong cua so nay.
echo ========================================================
pause

