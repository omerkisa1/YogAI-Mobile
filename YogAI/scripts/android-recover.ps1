param(
    [string]$AvdName = "Medium_Phone",
    [int]$BootTimeoutSec = 240
)

$ErrorActionPreference = 'Stop'

Write-Host "[1/6] Resetting ADB..."
adb kill-server | Out-Null
adb start-server | Out-Null

Write-Host "[2/6] Killing stale emulator processes..."
Get-CimInstance Win32_Process |
    Where-Object { $_.Name -match 'qemu-system|emulator' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

Write-Host "[3/6] Starting emulator ($AvdName) headless..."
$emulatorArgs = "-avd $AvdName -no-window -no-audio -no-snapshot-load -gpu swiftshader_indirect"
Start-Process -FilePath "emulator" -ArgumentList $emulatorArgs | Out-Null

Write-Host "[4/6] Waiting for emulator transport..."
$deadline = (Get-Date).AddSeconds($BootTimeoutSec)
$transportId = $null
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 3
    $devices = adb devices | Out-String
    if ($devices -match '(emulator-\d+)\s+device') {
        $transportId = $Matches[1]
        break
    }
}

if (-not $transportId) {
    throw "Emulator did not become ADB device within timeout ($BootTimeoutSec sec)."
}

Write-Host "[5/6] Waiting for Android boot completion on $transportId..."
$bootDone = $false
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 3
    $boot = (adb -s $transportId shell getprop sys.boot_completed 2>$null).Trim()
    if ($boot -eq '1') {
        $bootDone = $true
        break
    }
}

if (-not $bootDone) {
    throw "Emulator boot did not complete within timeout ($BootTimeoutSec sec)."
}

Write-Host "[6/6] Installing app (x86_64 only) and launching..."
& .\android\gradlew.bat -p android app:installDebug -PreactNativeDevServerPort=8081 -PreactNativeArchitectures=x86_64 --no-daemon
if ($LASTEXITCODE -ne 0) {
    throw "Gradle install failed with code $LASTEXITCODE"
}

adb -s $transportId shell monkey -p com.yogai -c android.intent.category.LAUNCHER 1 | Out-Null
Write-Host "Recovery + install + launch completed successfully."
