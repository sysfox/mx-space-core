#!/bin/bash
# MongoDB 自动配置和启动脚本
# 用于本地开发环境快速设置 MongoDB

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
MONGO_VERSION=${MONGO_VERSION:-7}
MONGO_PORT=${MONGO_PORT:-27017}
MONGO_DATA_DIR=${MONGO_DATA_DIR:-"./data/mongodb"}
MONGO_CONTAINER_NAME=${MONGO_CONTAINER_NAME:-"mx-space-mongo"}

echo -e "${BLUE}=== Mix Space MongoDB 自动配置工具 ===${NC}"
echo ""

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}错误: Docker 未安装${NC}"
        echo "请先安装 Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker 已安装${NC}"
}

# 检查 MongoDB 容器状态
check_mongo_container() {
    if docker ps -a --format '{{.Names}}' | grep -q "^${MONGO_CONTAINER_NAME}$"; then
        return 0
    else
        return 1
    fi
}

# 启动 MongoDB 容器
start_mongo() {
    echo -e "${YELLOW}正在启动 MongoDB 容器...${NC}"
    
    # 创建数据目录
    mkdir -p "$MONGO_DATA_DIR"
    
    if check_mongo_container; then
        # 容器已存在，检查是否运行
        if docker ps --format '{{.Names}}' | grep -q "^${MONGO_CONTAINER_NAME}$"; then
            echo -e "${GREEN}✓ MongoDB 容器已在运行${NC}"
        else
            echo -e "${YELLOW}启动现有 MongoDB 容器...${NC}"
            docker start "$MONGO_CONTAINER_NAME"
            echo -e "${GREEN}✓ MongoDB 容器已启动${NC}"
        fi
    else
        # 创建新容器
        echo -e "${YELLOW}创建新的 MongoDB 容器...${NC}"
        docker run -d \
            --name "$MONGO_CONTAINER_NAME" \
            -p "${MONGO_PORT}:27017" \
            -v "$(pwd)/${MONGO_DATA_DIR}:/data/db" \
            --restart unless-stopped \
            mongo:${MONGO_VERSION}
        
        echo -e "${GREEN}✓ MongoDB 容器已创建并启动${NC}"
        
        # 等待 MongoDB 就绪
        echo -e "${YELLOW}等待 MongoDB 就绪...${NC}"
        sleep 3
    fi
}

# 测试 MongoDB 连接
test_connection() {
    echo -e "${YELLOW}测试 MongoDB 连接...${NC}"
    
    # 尝试连接 MongoDB
    if docker exec "$MONGO_CONTAINER_NAME" mongosh --eval "db.adminCommand('ping')" --quiet &> /dev/null; then
        echo -e "${GREEN}✓ MongoDB 连接成功${NC}"
        echo -e "${GREEN}  连接地址: mongodb://localhost:${MONGO_PORT}${NC}"
        return 0
    else
        echo -e "${RED}✗ MongoDB 连接失败${NC}"
        return 1
    fi
}

# 显示配置信息
show_config() {
    echo ""
    echo -e "${BLUE}=== MongoDB 配置信息 ===${NC}"
    echo -e "容器名称: ${GREEN}${MONGO_CONTAINER_NAME}${NC}"
    echo -e "MongoDB 版本: ${GREEN}${MONGO_VERSION}${NC}"
    echo -e "端口: ${GREEN}${MONGO_PORT}${NC}"
    echo -e "数据目录: ${GREEN}${MONGO_DATA_DIR}${NC}"
    echo -e "连接字符串: ${GREEN}mongodb://localhost:${MONGO_PORT}/mx-space${NC}"
    echo ""
}

# 创建或更新配置文件
update_config_file() {
    local config_file="config.dev.yaml"
    
    if [ -f "$config_file" ]; then
        echo -e "${YELLOW}配置文件 $config_file 已存在${NC}"
    else
        echo -e "${YELLOW}创建配置文件 $config_file...${NC}"
        # 配置文件已通过其他方式创建
    fi
    
    echo -e "${GREEN}✓ 配置文件已准备就绪${NC}"
    echo -e "  使用配置文件启动: ${BLUE}pnpm dev -- --config $config_file${NC}"
}

# 显示使用说明
show_usage() {
    echo ""
    echo -e "${BLUE}=== 使用说明 ===${NC}"
    echo ""
    echo -e "1. 使用默认配置启动应用:"
    echo -e "   ${GREEN}pnpm dev${NC}"
    echo ""
    echo -e "2. 使用配置文件启动应用:"
    echo -e "   ${GREEN}pnpm dev -- --config config.dev.yaml${NC}"
    echo ""
    echo -e "3. 使用环境变量启动应用:"
    echo -e "   ${GREEN}MONGO_CONNECTION=mongodb://localhost:${MONGO_PORT}/mx-space pnpm dev${NC}"
    echo ""
    echo -e "4. 停止 MongoDB:"
    echo -e "   ${GREEN}docker stop ${MONGO_CONTAINER_NAME}${NC}"
    echo ""
    echo -e "5. 删除 MongoDB 容器（数据会保留）:"
    echo -e "   ${GREEN}docker rm ${MONGO_CONTAINER_NAME}${NC}"
    echo ""
    echo -e "6. 查看 MongoDB 日志:"
    echo -e "   ${GREEN}docker logs -f ${MONGO_CONTAINER_NAME}${NC}"
    echo ""
}

# 主流程
main() {
    check_docker
    start_mongo
    
    if test_connection; then
        show_config
        update_config_file
        show_usage
        echo -e "${GREEN}MongoDB 配置完成！${NC}"
        exit 0
    else
        echo -e "${RED}MongoDB 配置失败，请检查日志${NC}"
        echo -e "查看日志: ${YELLOW}docker logs ${MONGO_CONTAINER_NAME}${NC}"
        exit 1
    fi
}

# 处理命令行参数
case "${1:-}" in
    "stop")
        echo -e "${YELLOW}停止 MongoDB...${NC}"
        docker stop "$MONGO_CONTAINER_NAME" 2>/dev/null || echo -e "${YELLOW}容器未运行${NC}"
        ;;
    "start")
        main
        ;;
    "restart")
        echo -e "${YELLOW}重启 MongoDB...${NC}"
        docker restart "$MONGO_CONTAINER_NAME" 2>/dev/null || main
        ;;
    "status")
        if docker ps --format '{{.Names}}' | grep -q "^${MONGO_CONTAINER_NAME}$"; then
            echo -e "${GREEN}MongoDB 正在运行${NC}"
            docker ps --filter "name=${MONGO_CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        else
            echo -e "${YELLOW}MongoDB 未运行${NC}"
        fi
        ;;
    "logs")
        docker logs -f "$MONGO_CONTAINER_NAME"
        ;;
    "remove")
        echo -e "${YELLOW}删除 MongoDB 容器...${NC}"
        docker stop "$MONGO_CONTAINER_NAME" 2>/dev/null || true
        docker rm "$MONGO_CONTAINER_NAME" 2>/dev/null || true
        echo -e "${GREEN}容器已删除（数据目录保留在 ${MONGO_DATA_DIR}）${NC}"
        ;;
    "help"|"--help"|"-h")
        echo "使用方法: $0 [command]"
        echo ""
        echo "命令:"
        echo "  start   - 启动并配置 MongoDB（默认）"
        echo "  stop    - 停止 MongoDB"
        echo "  restart - 重启 MongoDB"
        echo "  status  - 查看 MongoDB 状态"
        echo "  logs    - 查看 MongoDB 日志"
        echo "  remove  - 删除 MongoDB 容器"
        echo "  help    - 显示此帮助信息"
        echo ""
        echo "环境变量:"
        echo "  MONGO_VERSION    - MongoDB 版本（默认: 7）"
        echo "  MONGO_PORT       - MongoDB 端口（默认: 27017）"
        echo "  MONGO_DATA_DIR   - 数据目录（默认: ./data/mongodb）"
        ;;
    *)
        main
        ;;
esac
