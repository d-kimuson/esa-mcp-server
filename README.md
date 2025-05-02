# esa-mcp-server

[![smithery badge](https://smithery.ai/badge/@d-kimuson/esa-mcp-server)](https://smithery.ai/server/@d-kimuson/esa-mcp-server)

esa-mcp-server は、[esa.io](https://esa.io) の API を [Model Context Protocol (MCP)](https://github.com/microsoft/model-context-protocol) を介して利用できるようにするサーバーです。

<a href="https://glama.ai/mcp/servers/undwqgwbtd"><img width="380" height="200" src="https://glama.ai/mcp/servers/undwqgwbtd/badge" alt="ESA Server MCP server" /></a>

## 機能

- get_search_query_document: esa.io の記事を検索するためのドキュメンテーションの提供
- search_esa_posts: esa.io の記事検索
- read_esa_post, read_esa_multiple_posts: 記事の詳細取得（単一・複数）
- create_esa_post: 記事の作成
- update_esa_post: 記事の更新
- delete_esa_post: 記事の削除

## Usage

利用するツールに合わせて以下のように設定ファイルを準備してください。

```json
{
  "mcpServers": {
    "esa-mcp-server": {
      "command": "npx",
      "args": ["-y", "esa-mcp-server@latest"],
      "env": {
        "ESA_API_KEY": "your api key here",
        "DEFAULT_ESA_TEAM": "your default esa team"
      }
    }
  }
}
```



## evals の実行方法

evals パッケージは MCP クライアントを読み込み、その後 `index.ts` ファイルを実行するため、テストのたびに再ビルドする必要はありません。環境変数は `npx` コマンドの前に付けることで読み込むことができます。完全なドキュメントは [こちら](https://www.mcpevals.io/docs) にあります。


```bash
OPENAI_API_KEY=your-key  npx mcp-eval src/evals/evals.ts src/server.ts
```
## プロンプト例

```markdown
## Using esa tools

esa の情報を検索するために esa 以下のツールを利用できます。

- 記事の検索には search_esa_posts ツールを利用します。複雑なクエリを利用する場合は get_search_query_document ツールで正確なクエリの記述方法を理解してから利用します。
- 記事本文を取得するには read_esa_post, read_esa_multiple_posts ツールを利用します。複数の記事を取得する必要がある場合は read_esa_multiple_posts でまとめて取得することを推奨します。
- 記事を作成/更新/削除するにはそれぞれ create_esa_post, update_esa_post, delete_esa_post ツールを利用します。
```

## 利用可能なツール

[src/server.ts](./src/server.ts) を確認してください。

## Contribution

歓迎します。
