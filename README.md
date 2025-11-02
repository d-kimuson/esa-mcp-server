# esa-mcp-server

[![smithery badge](https://smithery.ai/badge/@d-kimuson/esa-mcp-server)](https://smithery.ai/server/@d-kimuson/esa-mcp-server)

esa-mcp-server は、[esa.io](https://esa.io) の API を [Model Context Protocol (MCP)](https://github.com/microsoft/model-context-protocol) を介して利用できるようにするサーバーです。

<a href="https://glama.ai/mcp/servers/undwqgwbtd"><img width="380" height="200" src="https://glama.ai/mcp/servers/undwqgwbtd/badge" alt="ESA Server MCP server" /></a>

## 📢 重要なお知らせ

**[esa公式のローカルMCPサーバー](https://docs.esa.io/posts/561)がリリースされました！** 🎉

公式のMCP Serverは多機能で、チーム管理、記事管理、コメント管理、カテゴリ管理、ヘルプ・ドキュメント、Resource、Promptなど幅広い機能を提供しています。そちらも確認することをおすすめします。

### 公式とこのリポジトリの違い

公式のMCP Serverとこのリポジトリの実装にはトレードオフがあります：

- **公式**: 多機能でできることが多い（システムプロンプト: 約11.3k tokens）
- **このリポジトリ**: 記事の検索・追加・更新のツールに機能が限定されるが、コンパクトな設計（システムプロンプト: 約3.4k tokens, 公式比 1/3 以下）

### 推奨

公式の MCP Server の利用を推奨しますが、コンテキストウィンドウの圧迫が激しいため [d-kimuson/modular-mcp](https://github.com/d-kimuson/modular-mcp) のような遅延読み込みアプローチや、プロジェクトを限定した追加・必要な時だけ追加するといった運用とセットで利用するのがオススメです。

こういった面倒事を考えたくない場合は、このリポジトリの esa-mcp-server であれば比較的コンテキスト圧迫が激しくないため単体でも追加しやすいです。

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
