# =====================================================================
# SCRIPT BUILD GAS INDEX - TỰ ĐỘNG GHÉP DEMO VỚI GAS BRIDGE (CHUẨN UTF-8)
# =====================================================================

$demoPath = "demo_quan_ly_kho.html"
$bridgePath = "gas\gas_bridge.html"

if (-not (Test-Path $demoPath)) {
    Write-Error "Khong tim thay file $demoPath"
    exit 1
}

if (-not (Test-Path $bridgePath)) {
    Write-Error "Khong tim thay file $bridgePath"
    exit 1
}

# 1. Đọc nội dung với mã hóa UTF-8 tuyệt đối
$demoContent = [System.IO.File]::ReadAllText($demoPath, [System.Text.Encoding]::UTF8)
$bridgeContent = [System.IO.File]::ReadAllText($bridgePath, [System.Text.Encoding]::UTF8)

# 2. Chèn Bridge vào trước thẻ đóng </body></html>
$replacement = "$bridgeContent`n</body>`n</html>"
$newGasIndex = $demoContent -replace '(?s)</body>\s*</html>\s*$', $replacement

# 3. Ghi ra 2 file đích với chuẩn UTF-8 không BOM hoặc UTF-8 chuẩn
[System.IO.File]::WriteAllText('gas\Index.html', $newGasIndex, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText('src\frontend\Index.html', $newGasIndex, [System.Text.Encoding]::UTF8)

$sizeGas = (Get-Item 'gas\Index.html').Length
$sizeSrc = (Get-Item 'src\frontend\Index.html').Length

Write-Host "=========================================================="
Write-Host "BUILD GAS INDEX HOAN TAT THANH CONG (100% CHUAN UTF-8)!"
Write-Host "gas\Index.html size: $sizeGas bytes"
Write-Host "src\frontend\Index.html size: $sizeSrc bytes"
Write-Host "=========================================================="
