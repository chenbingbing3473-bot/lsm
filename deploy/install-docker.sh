#!/usr/bin/env bash
# Ubuntu / Debian / Alibaba Cloud Linux 安装 Docker Engine + Compose 插件
# 国内服务器优先使用阿里云镜像，避免 download.docker.com SSL 失败
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "请使用 sudo 运行: sudo bash deploy/install-docker.sh"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

install_docker_yum() {
  yum install -y yum-utils || dnf install -y yum-utils

  # 清理可能损坏的旧源
  rm -f /etc/yum.repos.d/docker-ce.repo

  yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
  sed -i 's+download.docker.com+mirrors.aliyun.com/docker-ce+' /etc/yum.repos.d/docker-ce.repo 2>/dev/null || true

  yum clean all || dnf clean all
  yum makecache || dnf makecache

  if yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin 2>/dev/null; then
    :
  elif dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin 2>/dev/null; then
    :
  else
    echo "[install-docker] 阿里云镜像失败，尝试系统自带 docker 包..."
    dnf install -y docker docker-compose-plugin 2>/dev/null || yum install -y docker
  fi

  systemctl enable --now docker
}

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  echo "Docker 已安装: $(docker --version)"
  docker compose version
  exit 0
fi

if command -v apt-get >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
    curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
  fi
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(. /etc/os-release && echo "${VERSION_CODENAME:-jammy}") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
elif command -v yum >/dev/null 2>&1 || command -v dnf >/dev/null 2>&1; then
  install_docker_yum
else
  curl -fsSL https://get.docker.com | sh -s -- --mirror Aliyun
fi

systemctl enable docker 2>/dev/null || true
systemctl start docker 2>/dev/null || true

# 国内服务器配置镜像加速
if [ -f "$(dirname "$0")/configure-docker-mirror.sh" ]; then
  bash "$(dirname "$0")/configure-docker-mirror.sh" || true
fi

echo "Docker 安装完成: $(docker --version)"
docker compose version
