# Start Chrome with remote debugging
$proc = Start-Process -FilePath "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--headless=new", "--remote-debugging-port=9222", "--disable-gpu", "file:///c:/Projects/Quan%20Ly%20Kho%20Thanh%20An/demo_quan_ly_kho.html" -PassThru
Start-Sleep -Seconds 2

try {
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:9222/json"
    $pageTab = $tabs | Where-Object { $_.url -like "*demo_quan_ly_kho.html*" } | Select-Object -First 1

    $wsUri = [System.Uri]$pageTab.webSocketDebuggerUrl
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource
    $ws.ConnectAsync($wsUri, $cts.Token).Wait()

    function Send-CDP($id, $method, $params) {
        $msgObj = @{ id = $id; method = $method; params = $params }
        $json = $msgObj | ConvertTo-Json -Compress
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
        $segment = New-Object System.ArraySegment[byte] -ArgumentList @(,$bytes)
        $ws.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()
    }

    function Read-CDP() {
        $buffer = New-Object byte[] 65536
        $segment = New-Object System.ArraySegment[byte] -ArgumentList @(,$buffer)
        $res = $ws.ReceiveAsync($segment, $cts.Token).Result
        return [System.Text.Encoding]::UTF8.GetString($buffer, 0, $res.Count)
    }

    Send-CDP 1 "Runtime.enable" @{}
    Send-CDP 2 "Page.enable" @{}
    Send-CDP 3 "Page.reload" @{} # Reload so we capture startup exceptions!

    for ($i = 0; $i -lt 30; $i++) {
        $msg = Read-CDP
        if ($msg -like "*exceptionThrown*" -or $msg -like "*error*" -or $msg -like "*Uncaught*") {
            Write-Host "EXCEPTION/ERROR: $msg"
        }
    }
} catch {
    Write-Host "Error: $_"
} finally {
    Stop-Process -Id $proc.Id -Force
}
