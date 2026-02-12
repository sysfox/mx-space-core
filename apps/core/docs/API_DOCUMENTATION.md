# Mix Space API 文档

## 概述

Mix Space 已集成完整的 OpenAPI 3.0 (Swagger) 文档，支持导入到 Apifox、Postman 等 API 管理工具。

## 访问 API 文档

### 在线文档 (Swagger UI)

启动服务后，访问以下地址查看交互式 API 文档：

```
http://localhost:2333/api-docs
```

该页面提供：
- 📖 完整的 API 接口列表
- 🔍 接口参数和响应说明
- 🧪 在线测试功能（Try it out）
- 🔐 JWT 认证支持

### OpenAPI 规范文件

项目根目录已包含预生成的 API 文档文件：

- **`openapi.json`** - JSON 格式的 OpenAPI 3.0 规范文件
- **`swagger.yaml`** - YAML 格式的 Swagger 规范文件

这两个文件都符合 OpenAPI 3.0 规范，可直接导入到以下工具：

- **Apifox** - 推荐使用（支持 JSON 和 YAML）
- **Postman** - 推荐 JSON 格式
- **Insomnia** - 支持两种格式
- **Swagger Editor** - 推荐 YAML 格式
- **APITable**
- 其他支持 OpenAPI 的工具

**注意**：这些文件已提交到仓库，无需运行服务即可直接使用。

### 更新文档

如需更新 API 文档到最新状态：

**方式一：启动服务自动更新**
```bash
pnpm dev
# 服务启动时会自动重新生成文档
```

**方式二：单独生成（推荐）**
```bash
pnpm -C apps/core swagger
```

此命令会：
- 快速生成 `openapi.json` 和 `swagger.yaml` 文件
- 不启动 HTTP 服务器
- 不需要数据库连接
- 适合在 CI/CD 流程中使用

## 导入到 Apifox

### 步骤

1. **获取 API 文档**
   
   方式一：直接使用仓库中的文档文件
   - `openapi.json` - JSON 格式（推荐用于 Apifox/Postman）
   - `swagger.yaml` - YAML 格式（推荐用于 Swagger Editor）
   
   方式二：生成最新文档（可选）
   ```bash
   # 启动服务（自动生成）
   pnpm dev
   
   # 或单独生成（推荐，更快）
   pnpm -C apps/core swagger
   ```

2. **导入到 Apifox**
   
   - 打开 Apifox 客户端
   - 创建新项目或选择已有项目
   - 点击 **导入** → **导入数据**
   - 选择 **OpenAPI/Swagger** 格式
   - 选择 `openapi.json` 或 `swagger.yaml` 文件
   - 或者直接粘贴文件内容
   - 点击确认导入

3. **验证导入结果**
   
   导入后，Apifox 会自动识别：
   - ✅ 所有 API 端点和分组（按模块）
   - ✅ 请求参数和数据模型
   - ✅ 响应结构
   - ✅ JWT 认证配置

## API 版本

- **当前版本**: v2
- **路由前缀**: 
  - 开发环境: 无前缀 (直接 `/posts`, `/pages` 等)
  - 生产环境: `/api/v2` (例如 `/api/v2/posts`)

## 认证

所有需要认证的接口都已标记 🔒 并需要 JWT Bearer Token。

### 使用方式

1. 在 Swagger UI 中，点击右上角 **Authorize** 按钮
2. 输入 JWT Token (不需要 `Bearer` 前缀)
3. 点击 **Authorize** 确认
4. 现在可以测试需要认证的接口

### 在 Apifox 中配置

1. 导入后，在环境配置中添加 Token 变量
2. 在接口认证中选择 Bearer Token
3. 使用变量引用，如 `{{token}}`

## API 模块

文档包含以下主要模块：

### 内容管理
- **Posts** - 文章管理
- **Pages** - 页面管理
- **Notes** - 笔记/日记
- **Categories** - 分类
- **Topics** - 专题
- **Draft** - 草稿

### 用户与评论
- **Auth** - 认证与授权
- **Owner** - 站长信息
- **Comment** - 评论管理
- **Reader** - 读者管理
- **Subscribe** - 订阅管理

### AI 功能
- **Ai** - AI 相关功能
- **Ai-writer** - AI 写作助手
- **Ai-summary** - AI 摘要生成
- **Ai-translation** - AI 翻译

### 系统功能
- **File** - 文件管理
- **Search** - 搜索
- **Feed** - RSS/Atom 订阅
- **Sitemap** - 站点地图
- **Backup** - 备份与恢复
- **Option** - 系统选项
- **Webhook** - Webhook 管理
- **Health** - 健康检查

## 响应格式

### 标准响应

大多数接口返回格式：

```json
{
  "data": { }
}
```

### 分页响应

使用 `@Paginator` 装饰器的接口：

```json
{
  "data": [ ],
  "pagination": {
    "total": 100,
    "size": 10,
    "page": 1,
    "total_page": 10,
    "has_next_page": true,
    "has_prev_page": false
  }
}
```

### 字段命名

响应数据使用 **snake_case** 命名（如 `created_at`, `category_id`），这是由 `JSONTransformInterceptor` 自动转换的。

## 技术细节

### 实现方式

- 使用 `@nestjs/swagger` 包
- 基于 OpenAPI 3.0 规范
- 自动从 Zod schemas 生成文档
- 通过装饰器增强接口描述

### 自动化特性

- ✅ 自动为所有控制器添加 API Tags
- ✅ 自动为需要认证的接口添加 Bearer Auth 标记
- ✅ 自动从 DTO 类推断参数类型
- ✅ 自动生成操作 ID (operationId)

## 维护指南

### 添加新接口文档

大多数情况下，Swagger 会自动从代码生成文档。如需增强文档，可以使用装饰器：

```typescript
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

@Get('/:id')
@ApiOperation({ summary: '获取文章详情' })
@ApiResponse({ status: 200, description: '成功' })
async getPost(@Param('id') id: string) {
  // ...
}
```

### 更新 DTO 文档

在 Zod schema 中使用 `.describe()` 方法：

```typescript
export const PostSchema = z.object({
  title: z.string().describe('文章标题'),
  slug: z.string().describe('URL 别名'),
})
```

### 重新生成文档

每次服务启动时都会自动重新生成 `openapi.json`。如需手动更新：

1. 停止服务
2. 重新启动服务
3. 新的 `openapi.json` 会覆盖旧文件

## 常见问题

### Q: 导入 Apifox 后没有分组？

A: 确保使用最新版本的 `openapi.json`。API 已自动按模块分组（Posts, Pages, Notes 等）。

### Q: 认证接口如何测试？

A: 先调用 `/api/v2/auth/login` 获取 token，然后在 Apifox 环境变量中配置 token。

### Q: 为什么有些字段名在文档中是 camelCase？

A: DTO 定义使用 camelCase，但实际 API 响应会自动转换为 snake_case。

### Q: 如何自定义 Swagger 配置？

A: 编辑 `apps/core/src/swagger.config.ts` 文件。

## 相关资源

- [OpenAPI 规范](https://swagger.io/specification/)
- [Apifox 官方文档](https://apifox.com/help/)
- [NestJS Swagger 文档](https://docs.nestjs.com/openapi/introduction)
- [Zod 文档](https://zod.dev/)

## 示例

### 在 Apifox 中调用示例

**获取文章列表**

```
GET /api/v2/posts?page=1&size=10
```

**创建新文章（需认证）**

```
POST /api/v2/posts
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "新文章",
  "slug": "new-post",
  "text": "文章内容...",
  "category_id": "..."
}
```

## 支持

如有问题，请访问：
- GitHub Issues: https://github.com/mx-space/core/issues
- 文档站点: https://mx-space.js.org
