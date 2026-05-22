#!/bin/bash
set -e

# 进入项目根目录
cd "$(dirname "$0")/.."

# 检查是否已构建
if [ ! -d "packages/server/dist" ]; then
    echo "未找到构建产物，请先运行构建脚本:"
    echo "  ./scripts/build.sh"
    exit 1
fi

# 设置默认环境变量
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-3000}

echo "========================================="
echo "  漫画阅读器 - 生产模式"
echo "========================================="
echo ""
echo "端口: $PORT"
echo "数据目录: ${DATA_DIR:-~/.comic-reader}"
echo ""
echo "访问地址: http://localhost:$PORT"
echo "========================================="

# 启动服务
cd packages/server
node dist/index.js
