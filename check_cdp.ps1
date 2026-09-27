$proc = Start-Process -FilePath "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--headless=new", "--remote-debugging-port=9222", "--disable-gpu", "file:///c:/Projects/Quan%20Ly%20Kho%20Thanh%20An/demo_quan_ly_kho.html" -PassThru
Start-Sleep -Seconds 2
try {
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:9222/json"
    foreach ($t in $tabs) {
        Write-Host "Tab: $($t.title) | $($t.url)"
        Write-Host "WS: $($t.webSocketDebuggerUrl)"
    }
} finally {
    Stop-Process -Id $proc.Id -Force
}
