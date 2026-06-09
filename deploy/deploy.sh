#!/usr/bin/env bash
# Lean-SpinMeal 一键部署（Linux / macOS / Git Bash）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_DIR="$ROOT/deploy"
ENV_FILE="$DEPLOY_DIR/.env"
COMPOSE_FILE="$DEPLOY_DIR/docker-compose.prod.yml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[deploy]${NC} $*"; }
warn()  { echo -e "${YELLOW}[deploy]${NC} $*"; }
error() { echo -e "${RED}[deploy]${NC} $*" >&2; }

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    error "缺少命令: $1"
    exit 1
  fi
}

detect_public_url() {
  local ip=""
  if command -v curl >/dev/null 2>&1; then
    ip="$(curl -fsS --max-time 3 http://100.100.100.200/latest/meta-data/eipv4 2>/dev/null || true)"
  fi
  if [ -z "$ip" ] && command -v hostname >/dev/null 2>&1; then
    ip="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"
  fi
  if [ -n "$ip" ]; then
    echo "http://${ip}"
  else
    echo "http://127.0.0.1"
  fi
}

ensure_docker() {
  if docker info >/dev/null 2>&1; then
    return 0
  fi
  warn "未检测到 Docker，尝试安装（需要 root）..."
  if [ -f "$DEPLOY_DIR/install-docker.sh" ]; then
    sudo bash "$DEPLOY_DIR/install-docker.sh"
  else
    error "请先安装 Docker: https://docs.docker.com/engine/install/"
    exit 1
  fi
}

ensure_env() {
  if [ ! -f "$ENV_FILE" ]; then
    cp "$DEPLOY_DIR/.env.example" "$ENV_FILE"
    local detected
    detected="$(detect_public_url)"
  sed -i.bak "s|PUBLIC_URL=.*|PUBLIC_URL=${detected}|" "$ENV_FILE" 2>/dev/null || \
    sed -i '' "s|PUBLIC_URL=.*|PUBLIC_URL=${detected}|" "$ENV_FILE" 2>/dev/null || true
    rm -f "$ENV_FILE.bak"
    info "已创建 $ENV_FILE，默认 PUBLIC_URL=$detected"
  fi

  # shellcheck disable=SC1090
  set -a
  source "$ENV_FILE"
  set +a

  if [ -z "${JWT_SECRET:-}" ]; then
    local secret
    secret="$(openssl rand -hex 32 2>/dev/null || head -c 48 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 48)"
    if grep -q '^JWT_SECRET=$' "$ENV_FILE" || ! grep -q '^JWT_SECRET=' "$ENV_FILE"; then
      echo "JWT_SECRET=${secret}" >> "$ENV_FILE"
    else
      sed -i.bak "s|^JWT_SECRET=.*|JWT_SECRET=${secret}|" "$ENV_FILE" 2>/dev/null || \
        sed -i '' "s|^JWT_SECRET=.*|JWT_SECRET=${secret}|" "$ENV_FILE"
      rm -f "$ENV_FILE.bak"
    fi
    info "已生成 JWT_SECRET"
    source "$ENV_FILE"
  fi

  if [ -z "${PUBLIC_URL:-}" ]; then
    error "请在 deploy/.env 中设置 PUBLIC_URL（例如 http://47.96.x.x）"
    exit 1
  fi
}

compose() {
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
}

main() {
  info "项目目录: $ROOT"
  need_cmd docker
  ensure_docker

  if ! docker compose version >/dev/null 2>&1; then
    error "需要 Docker Compose V2（docker compose）"
    exit 1
  fi

  ensure_env

  info "构建并启动服务（首次可能需几分钟）..."
  compose up -d --build

  if [ "${RUN_SEED:-true}" = "true" ]; then
    info "写入演示数据..."
    compose --profile seed run --rm seed || warn "种子数据可能已存在，可忽略"
  fi

  local port="${HTTP_PORT:-80}"
  local base="${PUBLIC_URL}"
  if [ "$port" != "80" ]; then
    base="${PUBLIC_URL%:*}:${port}"
  fi

  echo ""
  info "部署完成"
  echo "  访问地址:  ${base}"
  echo "  健康检查:  ${base}/api/health"
  echo "  查看日志:  docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env logs -f"
  echo "  停止服务:  docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env down"
  echo ""
  warn "安全组/防火墙请放行 TCP ${port}"
  warn "生产环境请修改 deploy/.env 中的 JWT_SECRET、PUBLIC_URL，并配置 DASHSCOPE_API_KEY"
}

main "$@"
