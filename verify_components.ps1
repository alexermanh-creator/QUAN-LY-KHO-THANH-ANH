$html = Get-Content -Raw 'gas\Index.html'
Write-Host "gas\Index.html size: $($html.Length) bytes"

$checks = @(
    "scanner-modal-title",
    "tab-cat-conditions",
    "nhap-loai-hang",
    "nhap-item-loai-hang",
    "BroadcastChannel",
    "openStandaloneCameraWindow",
    "renderCatalogConditionsTable",
    "INITIAL_CONDITIONS",
    "syncLoaiHangDropdowns"
)

foreach ($item in $checks) {
    if ($html.IndexOf($item) -ge 0) {
        Write-Host "[PASS] $item" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] $item" -ForegroundColor Red
    }
}
