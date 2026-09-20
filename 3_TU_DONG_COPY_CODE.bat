@echo off
chcp 65001 >nul
echo ========================================================
echo   DANG TU DONG NAP TOAN BO CODE MOI VAO CHUOT CUA BAN...
echo ========================================================
powershell -Command "$c = [System.IO.File]::ReadAllText('gas\Index.html', [System.Text.Encoding]::UTF8); Set-Clipboard -Value $c"
echo.
echo ========================================================
echo   THANH CONG! TOAN BO CODE MOI DA NAM SAN TRONG CHUOT!
echo ========================================================
echo.
echo He thong dang tu dong mo trinh duyet den trang Google Apps Script...
start https://script.google.com/d/1gh2JeFuQ106ksrpPuXAB0U1lCafpqkXyYnXnEPKBvkRsOQdT2ap70wpZ/edit
echo.
echo BAN CHI CAN THUC HIEN 3 THAO TAC (MAT 5 GIAY):
echo 1. O cot ben trai tren trinh duyet, bam chon file: Index.html
echo 2. Bam phim Ctrl + A (de chon het code cu), roi bam Ctrl + V (de dan code moi).
echo 3. Bam bieu tuong Luu (hoac Ctrl + S).
echo.
echo Nhu vay la he thong tren mang da duoc cap nhat 100%!
echo.
pause
