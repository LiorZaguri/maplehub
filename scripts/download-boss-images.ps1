$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$proj = Resolve-Path (Join-Path $root '..')
$outDir = Join-Path $proj 'public/bosses'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function Download-File($Url, $OutFile) {
  if (Test-Path $OutFile) { return }
  Write-Host "Downloading: $OutFile" -ForegroundColor Cyan
  Invoke-WebRequest -UseBasicParsing -Uri $Url -OutFile $OutFile
}

$map = @(
  @{ Url = 'https://static.wikia.nocookie.net/maplestory/images/3/34/Mobicon_Gollux_Head.png/revision/latest?cb=20140425052926'; Out = 'gollux.png' },
  @{ Url = 'https://static.wikia.nocookie.net/maplestory/images/e/e7/Mobicon_Von_Leon.png/revision/latest?cb=20101214125405'; Out = 'von-leon.png' },
  @{ Url = 'https://static.wikia.nocookie.net/maplestory/images/6/60/Mobicon_Horntail.png/revision/latest?cb=20121217084804'; Out = 'horntail.png' }
)

foreach ($m in $map) {
  Download-File -Url $m.Url -OutFile (Join-Path $outDir $m.Out)
}


Write-Host "Boss image download complete." -ForegroundColor Green


