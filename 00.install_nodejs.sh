
# Node.js 的设计是：
# 	•	每个项目自带依赖
# 	•	依赖装在项目目录下
# 	•	默认就是“隔离的”


# --------------------------- 安装Node.js (直接下载二进制包) ---------------------------
# 使用淘宝镜像下载 Node.js v24
NODE_VERSION="24.13.0"
NODE_FILE="node-v${NODE_VERSION}-linux-x64.tar.xz"
NODE_URL="https://npmmirror.com/mirrors/node/v${NODE_VERSION}/${NODE_FILE}"

# 下载 Node.js
echo "正在从淘宝镜像下载 Node.js ${NODE_VERSION}..."
wget -O /tmp/${NODE_FILE} ${NODE_URL}

# 解压并安装
echo "解压安装..."
tar -xf /tmp/${NODE_FILE} -C /tmp/

# 移动到用户目录
mkdir -p $HOME/.local
mv /tmp/node-v${NODE_VERSION}-linux-x64 $HOME/.local/node

# 配置环境变量 (添加到 ~/.bashrc)
echo '' >> ~/.bashrc
echo '# Node.js 环境变量' >> ~/.bashrc
echo 'export PATH=$HOME/.local/node/bin:$PATH' >> ~/.bashrc
echo 'export NODE_PATH=$HOME/.local/node/lib/node_modules' >> ~/.bashrc

# 立即生效
export PATH=$HOME/.local/node/bin:$PATH
export NODE_PATH=$HOME/.local/node/lib/node_modules

# 设置 npm 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 验证安装
echo ""
echo "===== 安装完成 ====="
node -v
npm -v

