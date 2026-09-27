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
        return $txt
    }

    # First, fill username and password in DOM
    $res1 = Eval-JS 1 "document.getElementById('screen-login-username').value = 'admin'"
    Write-Host "Set username: $res1"
    $res2 = Eval-JS 2 "document.getElementById('screen-login-password').value = '123456'"
    Write-Host "Set password: $res2"

    # Now click the button!
    $res3 = Eval-JS 3 "document.getElementById('btn-submit-screen-login').click()"
    Write-Host "Click button: $res3"

    Start-Sleep -Seconds 1

    # Check button text and overlay display
    $res4 = Eval-JS 4 "document.getElementById('btn-submit-screen-login').innerHTML"
    Write-Host "Button HTML: $res4"

    $res5 = Eval-JS 5 "document.getElementById('app-login-screen').style.display"
    Write-Host "Login Screen Display: $res5"

    $res6 = Eval-JS 6 "window.CURRENT_USER_NAME + ' | ' + window.CURRENT_ROLE"
    Write-Host "Logged in user: $res6"

} catch {
    Write-Host "Error: $_"
} finally {
    Stop-Process -Id $proc.Id -Force
}
