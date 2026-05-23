# Start MongoDB on Windows (after MongoDB.Server is installed via winget or MSI)
$serviceNames = @('MongoDB', 'MongoDB Server (MongoDB)')

foreach ($name in $serviceNames) {
  $svc = Get-Service -Name $name -ErrorAction SilentlyContinue
  if ($svc) {
    if ($svc.Status -ne 'Running') {
      Write-Host "Starting service: $name ..."
      Start-Service -Name $name
    } else {
      Write-Host "MongoDB service '$name' is already running."
    }
    exit 0
  }
}

# Fallback: run mongod if installed in default path
$mongod = @(
  "${env:ProgramFiles}\MongoDB\Server\8.0\bin\mongod.exe",
  "${env:ProgramFiles}\MongoDB\Server\8.3\bin\mongod.exe",
  "${env:ProgramFiles}\MongoDB\Server\7.0\bin\mongod.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($mongod) {
  $dataDir = "$env:LOCALAPPDATA\MongoDB\data"
  $logDir = "$env:LOCALAPPDATA\MongoDB\log"
  New-Item -ItemType Directory -Force -Path $dataDir, $logDir | Out-Null
  Write-Host "Starting mongod: $mongod"
  Start-Process -FilePath $mongod -ArgumentList "--dbpath", $dataDir, "--logpath", "$logDir\mongod.log" -WindowStyle Hidden
  exit 0
}

Write-Host "MongoDB not found. Install with: winget install MongoDB.Server"
Write-Host "Or use MongoDB Atlas and set MONGO_URI in backend/.env"
exit 1
