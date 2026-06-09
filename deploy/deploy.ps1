# Windows 本机一键部署（需已安装 Docker Desktop）
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$DeployDir = Join-Path $Root "deploy"
$EnvFile = Join-Path $DeployDir ".env"
$ComposeFile = Join-Path $DeployDir "docker-compose.prod.yml"

function Write-Info($msg) { Write-Host "[deploy] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[deploy] $msg" -ForegroundColor Yellow }

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Warn "请先安装 Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
}

if (-not (Test-Path $EnvFile)) {
    Copy-Item (Join-Path $DeployDir ".env.example") $EnvFile
    (Get-Content $EnvFile) -replace 'PUBLIC_URL=.*', 'PUBLIC_URL=http://127.0.0.1' | Set-Content $EnvFile
    $secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
    Add-Content $EnvFile "JWT_SECRET=$secret"
    Write-Info "已创建 deploy\.env"
}

Set-Location $Root
Write-Info "构建并启动..."
docker compose -f $ComposeFile --env-file $EnvFile up -d --build

$runSeed = (Select-String -Path $EnvFile -Pattern '^RUN_SEED=(.+)$').Matches.Groups[1].Value
if ($runSeed -ne 'false') {
    Write-Info "写入演示数据..."
    docker compose -f $ComposeFile --env-file $EnvFile --profile seed run --rm seed 2>$null
}

Write-Info "部署完成 → http://127.0.0.1 （端口见 deploy\.env 中 HTTP_PORT）"
Write-Info "健康检查 → http://127.0.0.1/api/health"
