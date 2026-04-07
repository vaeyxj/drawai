# DrawAI

一款基于 Google Gemini 的 AI 绘图 Web 应用，专为游戏开发者和数字艺术家设计，支持 AI 图像生成、游戏素材加工和精灵图切割。

## 功能特性

### AI 图像生成
- 支持多个 Gemini 图像生成模型（Pro / Flash / Flash 2）
- 多种画幅比例（1:1、16:9、9:16、4:3、3:4）和分辨率（1K / 2K）
- 参考图风格迁移：上传或粘贴参考图引导生成风格
- 20+ 快捷提示词模板，涵盖像素角色、场景建筑、道具物品、UI 特效等

### 素材管理
- 图库浏览、搜索、按模型筛选
- 收藏夹功能，防止历史清理时误删
- 单图下载

### 游戏素材工作台
- **绿幕去除**：自动移除 #00FF00 绿色背景，可调硬/软阈值，支持棋盘格预览，导出透明 PNG
- **精灵图切割**：配置帧尺寸、网格对齐预览、动画回放预览、批量下载帧图片
- 素材分类管理（角色、道具、场景、UI、特效等）

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 6 |
| 样式 | Tailwind CSS 4 |
| 状态管理 | Zustand 5 |
| 路由 | React Router 7 |
| 动画 | Framer Motion |
| 存储 | IndexedDB (idb-keyval) + Disk API |

## 安装与启动

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 配置 API

支持 Google Gemini 官方 Key 和第三方中转 Key，可通过 `.env` 文件或应用内设置弹窗配置。

在项目根目录创建 `.env` 文件：

```env
# 官方 Gemini Key (AIza 开头) 或中转 Key (sk- 开头)
VITE_API_KEY=your_api_key_here

# 可选：自定义 Base URL（中转服务地址，不填则使用默认地址）
VITE_BASE_URL=https://your-proxy.com
```

| Key 类型 | 格式 | 认证方式 | 默认 Base URL |
|----------|------|----------|---------------|
| 官方 Gemini | `AIza...` | Query 参数 `?key=` | `https://generativelanguage.googleapis.com` |
| 中转 Key | `sk-...` | Header `Authorization: Bearer` | 内置代理地址 |

未配置 `.env` 时，需要在应用内通过设置弹窗配置 API Key 后才能使用生成功能。

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173 打开应用。

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
src/
├── components/       # UI 组件
│   ├── generation/   # 图像生成相关（提示词输入、模型选择、画幅选择等）
│   ├── assets/       # 素材加工相关（绿幕处理、精灵图切割）
│   ├── gallery/      # 图库展示
│   ├── layout/       # 布局组件（头部导航、移动端导航）
│   ├── settings/     # 设置（API Key 配置）
│   └── ui/           # 通用 UI 组件（Toast、Spinner）
├── pages/            # 页面
│   ├── GeneratePage  # 生成页
│   ├── GalleryPage   # 图库页
│   ├── FavoritesPage # 收藏页
│   └── AssetsPage    # 素材工作台页
├── services/         # API 调用与存储服务
├── store/            # Zustand 状态管理
├── types/            # TypeScript 类型定义
├── constants/        # 常量（模型配置、快捷提示词、素材预设）
└── utils/            # 工具函数（图像解析、绿幕处理、精灵图切割、存储）
```
