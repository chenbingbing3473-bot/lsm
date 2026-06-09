#!/usr/bin/env bash
# Ubuntu / Debian / Alibaba Cloud Linux 安装 Docker Engine + Compose 插件
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "请使用 sudo 运行: sudo bash deploy/install-docker.sh"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

if command -v apt-get >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
  fi
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${VERSION_CODENAME:-jammy}") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
elif command -v yum >/dev/null 2>&1; then
  yum install -y yum-utils
  yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
  yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable --now docker
else
  curl -fsSL https://get.docker.com | sh
fi

systemctl enable docker 2>/dev/null || true
systemctl start docker 2>/dev/null || true

echo "Docker 安装完成: $(docker --version)"
docker compose version
