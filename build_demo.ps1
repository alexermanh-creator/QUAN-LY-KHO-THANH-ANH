$files = @(
    '01_header_and_styles.html',
    '02_topbar_and_sidebar.html',
    '03_modules_html.html',
    '04_modals_html.html',
    '05_mock_data.js',
    '06_app_logic.js',
    '07_camera_scanner.js',
    '08_nhap_kho_logic.js',
    '09_xuat_kho_logic.js',
    '10_ton_kho_and_360.js',
    '11_warranty_cases.js',
    '12_lich_su_and_audit.js',
    '13_nghiep_vu_kho_and_dashboard.js'
)

$combined = ""
foreach ($f in $files) {
    $filePath = Join-Path "src_demo" $f
    if (Test-Path $filePath) {
        $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
        $combined += $content + "`n"
    } else {
        Write-Error "File not found: $filePath"
    }
}

[System.IO.File]::WriteAllText("demo_quan_ly_kho.html", $combined, [System.Text.Encoding]::UTF8)
$fi = Get-Item "demo_quan_ly_kho.html"
Write-Host "Build demo_quan_ly_kho.html SUCCESS! Size: $($fi.Length) bytes"
