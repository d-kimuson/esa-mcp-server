# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発コマンド

- **ビルド**: `pnpm build` - orvalによるコード生成 + esbuildによるバンドルを実行
- **開発モード**: `pnpm dev` - TypeScriptのwatch mode + OpenAPIのwatch modeを開始
- **テスト**: `pnpm test` - vitestのテストスイートを実行
- **リント**: `pnpm lint` - redocly lint + prettierチェックを実行
- **型チェック**: `pnpm typecheck` - TypeScriptの型チェックを実行
- **コード整形**: `pnpm fix` - prettierで自動フォーマット
- **MCP Inspector**: `pnpm inspect` - ビルド後にMCPインスペクターを起動（デバッグ用）

## アーキテクチャ概要

このプロジェクトは esa.io API を MCP (Model Context Protocol) サーバーとして提供するものです。

### 主要コンポーネント

- **エントリーポイント**: `src/index.ts` - stdio transportでMCPサーバーを作成・起動
- **サーバー定義**: `src/server.ts` - 全MCPツールとその実装を定義
- **APIクライアント**: `src/api.ts` - esa.io API呼び出しとエラーハンドリング、レスポンス処理
- **生成されたAPI**: `src/generated/esa-api/` - orvalでOpenAPI仕様から自動生成

### 提供するMCPツール

1. `get_search_query_document` - 検索クエリのドキュメントを返す
2. `search_esa_posts` - ページネーションとフィルタリングでesa記事を検索
3. `read_esa_post` / `read_esa_multiple_posts` - 記事コンテンツを取得
4. `create_esa_post` / `update_esa_post` / `delete_esa_post` - CRUD操作

### コード生成ワークフロー

orvalを使用してOpenAPI仕様からTypeScript APIクライアントコードを生成：
- OpenAPI仕様は `openapi-spec/` ディレクトリに格納
- orval設定は `orval.config.ts`
- 生成されたコードは `src/generated/esa-api/` に配置
- `pnpm build:orval` でAPIクライアントを再生成

### 環境変数

- `ESA_API_KEY` - esa.io API認証に必要
- `DEFAULT_ESA_TEAM` - esa操作のデフォルトチーム名

### レスポンス形式

全ツールレスポンスは `formatTool` ユーティリティを通じてトークン効率化のためYAML形式を使用。

### コーディングメモ

- node の標準ライブラリ使うときは node:path みたいな prefix ちゃんとつけて
- ライブラリを追加するときは package.json を直接触るのは厳禁。pnpm add, pnpm add -D を使って追加して。