# 创意贴纸工坊 (Creative Sticker Workshop)

一个基于 Next.js 和 AI 技术的创意贴纸生成平台，用户可以通过简单的文字描述生成独特的贴纸图片。

## 功能特点

- 🎨 AI 驱动的贴纸生成
- 🔐 GitHub OAuth 登录
- 💰 用户余额管理
- 📥 贴纸下载功能
- 🎯 实时预览
- 💫 优雅的动画效果

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **样式方案**: CSS Modules
- **认证方案**: NextAuth.js
- **数据库**: PostgreSQL
- **AI 接口**: Coze API
- **开发工具**: TypeScript

## 环境要求

- Node.js 18+
- PostgreSQL 14+
- npm 或 yarn

## 本地开发

1. 克隆项目
```bash
git clone [项目地址]
cd 项目名
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
复制 `.env.example` 到 `.env.local` 并填写以下配置

4. 初始化数据库
/lib/schema.sql

访问 http://localhost:3000 查看应用。
