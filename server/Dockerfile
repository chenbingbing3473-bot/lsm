# 国内部署：使用阿里云 Docker Hub 镜像，避免 registry-1.docker.io 超时
FROM registry.cn-hangzhou.aliyuncs.com/library/node:20-alpine

WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
RUN mkdir -p uploads

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "src/index.js"]
