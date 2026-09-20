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
    echo [HUONG DAN KHAC PHUC NHANH]
    echo Neu gap loi dang nhap hoac loi quyen API:
    echo Ban hay nhap dup file: "3_TU_DONG_COPY_CODE.bat"
    echo File nay se tu dong copy toan bo code vao chuot va mo trang
    echo Apps Script de ban chi can Ctrl+V la xong ngay trong 5 giay!
    echo ========================================================
)
pause
