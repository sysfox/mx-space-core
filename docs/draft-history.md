# 草稿历史版本管理

## 概述

本次修改为草稿（Draft）模块新增了历史版本管理功能，允许用户追踪草稿的编辑历史，并在需要时恢复到之前的版本。

## 核心变更

### 新增文件

- `apps/core/src/modules/draft/draft-history.service.ts` — 历史版本管理服务，负责版本快照的创建、压缩与还原
- `apps/core/src/modules/draft/diff/diff-strategy.interface.ts` — Diff 策略接口定义
- `apps/core/src/modules/draft/diff/text-diff.strategy.ts` — 基于 `diff-match-patch` 的纯文本 Diff 策略（适用于 Markdown）
- `apps/core/src/modules/draft/diff/json-diff.strategy.ts` — 基于 `jsondiffpatch` 的 JSON Diff 策略（适用于 Lexical 富文本）

### 修改文件

- `apps/core/src/modules/draft/draft.service.ts` — 在保存草稿时集成历史版本逻辑
- `apps/core/src/modules/draft/draft.model.ts` — 新增 `DraftHistoryModel` 子文档结构
- `apps/core/src/modules/draft/draft.module.ts` — 注册 `DraftHistoryService`

## 存储策略

为节省存储空间，历史版本采用 **混合快照** 策略：

| 条件 | 存储方式 |
|------|----------|
| 首次保存 | 全量快照（Full Snapshot） |
| 每隔 5 个版本 | 全量快照 |
| Diff 大小超过原文 70% | 全量快照 |
| 其余情况 | 增量 Diff（相对于最近的全量快照） |

历史版本上限为 **100 条**，超出时自动裁剪并保证最旧的条目可解析。

## Diff 策略

### 文本内容（Markdown）

使用 `diff-match-patch` 库生成 patch 文本，还原时通过 apply patch 得到完整内容。

### JSON 内容（Lexical 富文本）

使用 `jsondiffpatch` 库对 Lexical JSON 结构进行深度 diff，支持数组元素的精确追踪（通过 `id`/`type` 字段做 hash）。

## API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| `GET` | `/api/v2/drafts/:id/history` | 获取历史版本摘要列表 |
| `GET` | `/api/v2/drafts/:id/history/:version` | 获取指定版本的完整内容 |
| `POST` | `/api/v2/drafts/:id/restore/:version` | 将草稿恢复到指定历史版本 |

> 所有端点均需要鉴权（`@Auth()`）。

## 数据模型

```ts
interface DraftHistoryModel {
  version: number        // 版本号
  title: string          // 该版本的标题
  text?: string          // Markdown 下的正文（全量或 patch）
  content?: string       // Lexical 下的 JSON 内容（全量或 patch）
  contentFormat: ContentFormat
  typeSpecificData?: string
  savedAt: Date          // 保存时间
  isFullSnapshot: boolean // 是否为全量快照
  refVersion?: number    // 无 diff 时指向全量快照版本
  baseVersion?: number   // 生成 diff 所依赖的全量快照版本
}
```

## 工作流程

1. **保存草稿时**：`DraftService.update()` 调用 `DraftHistoryService.hasContentChange()` 检测内容是否有变化。若有变化，调用 `pushHistoryEntry()` 将当前版本推入历史记录，然后版本号加一。
2. **查看历史时**：`getHistory()` 返回版本摘要列表（不含完整内容）；`getHistoryVersion()` 返回指定版本的完整内容（自动还原 diff）。
3. **恢复历史版本时**：先将当前版本存入历史，再将指定历史版本的内容还原并覆盖草稿当前内容，版本号加一。
