# StudyOS

StudyOS 是一个面向个人学习的操作系统：目标、课程、资料、计划、今日任务、专注、复习与数据分析共同形成学习闭环。

## 技术栈

- Next.js App Router + TypeScript
- React + Tailwind CSS
- Prisma + PostgreSQL（数据库阶段启用）
- Auth.js + Zod
- Vitest

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:3000。

## 常用命令

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

项目按大纲分阶段交付，当前处于 Phase 0 工程初始化。

## 以后如何打开

最简单的方式：双击项目根目录里的 `Start-StudyOS.bat`。

脚本会以 production 模式自动：
1. 启动本地 PostgreSQL
2. 启动 Next.js 开发服务器
3. 等待网站就绪后打开浏览器

也可以在终端运行：

```bash
npm run open
```

关闭时按 Ctrl+C，数据库和网站会一起停止。