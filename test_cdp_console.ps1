# Start Chrome Headless with Remote Debugging
$proc = Start-Process -FilePath "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--headless=new", "--remote-debugging-port=9222", "--disable-gpu", "file:///c:/Projects/Quan%20Ly%20Kho%20Thanh%20An/demo_quan_ly_kho.html" -PassThru
Start-Sleep -Seconds 2

try {
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:9222/json"
    $pageTab = $tabs | Where-Object { $_.url -like "*demo_quan_ly_kho.html*" } | Select-Object -First 1

    if (-not $pageTab) {
        Write-Host "Page tab not found!"
        exit 1
    }

    $wsUri = [System.Uri]$pageTab.webSocketDebuggerUrl
    Write-Host "Connecting to CDP WebSocket: $wsUri"

    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource
    $ws.ConnectAsync($wsUri, $cts.Token).Wait()

    # Helper function to send CDP command
    function Send-CDP($id, $method, $params) {
        $msgObj = @{ id = $id; method = $method; params = $params }
        $json = $msgObj | ConvertTo-Json -Compress
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
        $segment = New-Object System.ArraySegment[byte] -ArgumentList @(,$bytes)
        $ws.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()
    }

    # Helper function to receive messages
    function Read-CDP() {
        $buffer = New-Object byte[] 65536
        $segment = New-Object System.ArraySegment[byte] -ArgumentList @(,$buffer)
        $res = $ws.ReceiveAsync($segment, $cts.Token).Result
        return [System.Text.Encoding]::UTF8.GetString($buffer, 0, $res.Count)
    }

    Send-CDP 1 "Runtime.enable" @{}
    Send-CDP 2 "Console.enable" @{}
    Start-Sleep -Milliseconds 500

    # Let's evaluate window.handleSystemLogin
    Send-CDP 3 "Runtime.evaluate" @{ expression = "typeof window.handleSystemLogin" }
    Start-Sleep -Milliseconds 500

    # Read pending responses
    for ($i = 0; $i -lt 10; $i++) {
        $resp = Read-CDP
        Write-Host "CDP Msg: $resp"
        if ($resp -like "*typeof window.handleSystemLogin*") { break }
    }

    # Now let's try calling handleSystemLogin('screen') and inspect result
    Send-CDP 4 "Runtime.evaluate" @{ expression = "handleSystemLogin('screen')" }
    Start-Sleep -Milliseconds 500

    for ($i = 0; $i -lt 10; $i++) {
        $resp = Read-CDP
        Write-Host "CDP Msg 2: $resp"
    }

} catch {
    Write-Host "Error: $_"
} finally {
    Stop-Process -Id $proc.Id -Force
}
