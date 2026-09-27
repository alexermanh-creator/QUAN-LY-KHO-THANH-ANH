$targetUrl = "https://script.google.com/macros/s/AKfycbxWJGAsTijUt3nCFFZpWWUAtcMJBARp5w9Dv9-TmgJOIgSXqXl8S71Te9Sf4Zm_ZcxK/exec"

$proc = Start-Process -FilePath "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--headless=new", "--remote-debugging-port=9222", "--disable-gpu", $targetUrl -PassThru
Start-Sleep -Seconds 6 # Give GAS iframe time to load

try {
    $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:9222/json"
    Write-Host "Tabs found:"
    $tabs | ForEach-Object { Write-Host "$($_.title) | $($_.url)" }

    $pageTab = $tabs | Where-Object { $_.url -like "*google*" -or $_.url -like "*macros*" } | Select-Object -First 1

    if (-not $pageTab) {
        Write-Host "GAS tab not found!"
        exit 1
    }

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
    Send-CDP 2 "Console.enable" @{}
    Start-Sleep -Milliseconds 500

    # Let's inspect all frames and contexts
    function Eval-JS($id, $expr) {
        Send-CDP $id "Runtime.evaluate" @{ expression = $expr }
        Start-Sleep -Milliseconds 500
        for ($i = 0; $i -lt 5; $i++) {
            $msg = Read-CDP
            if ($msg -like "*result*") {
                Write-Host "$expr => $msg"
                break
            }
        }
    }

    Eval-JS 10 "document.title"
    Eval-JS 11 "document.location.href"
    Eval-JS 12 "document.querySelectorAll('iframe').length"
    Eval-JS 13 "document.body ? document.body.innerHTML.substring(0, 300) : 'no body'"

} catch {
    Write-Host "Error: $_"
} finally {
    Stop-Process -Id $proc.Id -Force
}
