#!/usr/bin/env bash
# 配置 Docker 国内镜像加速（解决 registry-1.docker.io 超时）
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "请使用 root 运行: sudo bash deploy/configure-docker-mirror.sh"
  exit 1
fi

mkdir -p /etc/docker

# 若已有 daemon.json，保留其他配置仅合并 registry-mirrors
MIRRORS='[
    "https://docker.m.daocloud.io",
    "https://docker.1panel.live",
    "https://hub.rat.dev"
  ]'

if [ -f /etc/docker/daemon.json ]; then
  cp /etc/docker/daemon.json /etc/docker/daemon.json.bak.$(date +%s)
fi

cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.1panel.live",
    "https://hub.rat.dev"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

systemctl daemon-reload
systemctl restart docker

echo "[mirror] Docker 镜像加速已配置"
echo "[mirror] 注意: 请勿把 daemon.json 写成 https://你的ID.mirror.aliyuncs.com 占位符"
echo "[mirror] 测试拉取 node:20-alpine ..."
if docker pull registry.cn-hangzhou.aliyuncs.com/library/node:20-alpine; then
  echo "[mirror] node 镜像 OK"
else
  echo "[mirror] node 拉取失败，deploy 已改用 Dockerfile 内阿里云地址，可继续 deploy.sh"
fi
echo "[mirror] 测试拉取 mongo:7 ..."
if docker pull mongo:7; then
  echo "[mirror] 成功！可继续: bash deploy/deploy.sh"
else
  echo "[mirror] 仍失败，请登录阿里云控制台获取专属加速器："
  echo "  https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors"
  echo "  将专属地址加入 /etc/docker/daemon.json 的 registry-mirrors 后执行:"
  echo "  systemctl restart docker && docker pull mongo:7"
fi
