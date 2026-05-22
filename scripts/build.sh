#!/bin/bash
set -e

echo "========================================="
echo "  漫画阅读器 - 构建脚本"
echo "========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未找到 Node.js，请先安装 Node.js >= 18${NC}"
    exit 1
fi

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}pnpm 未安装，正在安装...${NC}"
    npm install -g pnpm
fi

# 进入项目根目录
cd "$(dirname "$0")/.."

echo ""
echo -e "${GREEN}[1/4] 安装依赖...${NC}"
pnpm install --frozen-lockfile

echo ""
echo -e "${GREEN}[2/4] 构建前端...${NC}"
pnpm --filter client build

echo ""
echo -e "${GREEN}[3/4] 构建后端...${NC}"
pnpm --filter server build

echo ""
echo -e "${GREEN}[4/4] 复制前端产物到后端...${NC}"
mkdir -p packages/server/dist/public
cp -r packages/client/dist/* packages/server/dist/public/

echo ""
echo "========================================="
echo -e "${GREEN}构建完成！${NC}"
echo ""
echo "产物目录: packages/server/dist/"
echo ""
echo "启动命令:"
echo "  cd packages/server && node dist/index.js"
echo ""
echo "或使用:"
echo "  pnpm start"
echo "========================================="
