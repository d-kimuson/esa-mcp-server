# esa-mcp-server
[![smithery badge](https://smithery.ai/badge/@d-kimuson/esa-mcp-server)](https://smithery.ai/server/@d-kimuson/esa-mcp-server)

esa-mcp-server は、[esa.io](https://esa.io) の API を [Model Context Protocol (MCP)](https://github.com/microsoft/model-context-protocol) を介して利用できるようにするサーバーです。

<a href="https://glama.ai/mcp/servers/undwqgwbtd"><img width="380" height="200" src="https://glama.ai/mcp/servers/undwqgwbtd/badge" alt="ESA Server MCP server" /></a>

## 機能

- esa.io の記事検索
- 記事の詳細取得（単一・複数）
- MCP 準拠のインターフェース提供

## Usage

利用するツールに合わせて以下のように設定ファイルを準備してください。

```json
{
  "mcpServers": {
    "esa-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "esa-mcp-server@latest"
      ]
    },
    "env": {
      "ESA_API_KEY": "your api key here",
      "DEFAULT_ESA_TEAM": "your default esa team"
    }
  }
}
```

## 利用可能なツール

### search_esa_posts

esa.io の記事を検索します。

```typescript
type SearchPostsParams = {
  teamName?: string;
  query: string;
  order?: "asc" | "desc";
  sort?: "created" | "updated" | "number" | "stars" | "comments" | "best_match";
  page?: number;
  perPage?: number;
}
```

esa の記事検索 API は、記事の本文も返しますが MCP Server のレスポンスには含めないようにしています。

これは検索の時点でヒットした全記事の本文を返すとトークン数を激しく消費してしまうためです。

各パラメータの用途は [esa API v1 の公式ドキュメント](https://docs.esa.io/posts/102) を参照してください。

### read_esa_post

指定した投稿番号の記事を取得します。

```typescript
type ReadPostParams = {
  teamName?: string;
  postNumber: number;
}
```

### read_esa_multiple_posts

複数の投稿番号の記事を一括で取得します。

```typescript
type ReadMultiplePostsParams = {
  teamName?: string;
  postNumbers: number[];
}
```

## Contribution

歓迎します。
