$proc = Start-Process -FilePath "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--headless=new", "--remote-debugging-port=9222", "--disable-gpu", "file:///c:/Projects/Quan%20Ly%20Kho%20Thanh%20An/demo_quan_ly_kho.html" -PassThru
Start-Sleep -Seconds 2

try {
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:9222/json"
    $pageTab = $tabs | Where-Object { $_.url -like "*demo_quan_ly_kho.html*" } | Select-Object -First 1

    $wsUri = [System.Uri]$pageTab.webSocketDebuggerUrl
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource
    $ws.ConnectAsync($wsUri, $cts.Token).Wait()

    function Eval-JS($id, $expr) {
        $msgObj = @{ id = $id; method = "Runtime.evaluate"; params = @{ expression = $expr } }
        $json = $msgObj | ConvertTo-Json -Compress
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
        $segment = New-Object System.ArraySegment[byte] -ArgumentList @(,$bytes)
        $ws.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()

        $buffer = New-Object byte[] 65536
        $segRecv = New-Object System.ArraySegment[byte] -ArgumentList @(,$buffer)
        $res = $ws.ReceiveAsync($segRecv, $cts.Token).Result
        $txt = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $res.Count)
        Write-Host "$expr => $txt"
    }

    Eval-JS 1 "typeof INITIAL_PRODUCTS"
    Eval-JS 2 "typeof SERIAL_DB"
    Eval-JS 3 "typeof WarehouseAPI"
    Eval-JS 4 "typeof handleSystemLogin"
    Eval-JS 5 "typeof window.handleSystemLogin"

} catch {
    Write-Host "Error: $_"
} finally {
    Stop-Process -Id $proc.Id -Force
}
