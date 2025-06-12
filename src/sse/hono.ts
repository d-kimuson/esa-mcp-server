import { Hono } from "hono"
import { streamSSE } from "hono/streaming"
import { cors } from "hono/cors"
import { SSETransport } from "hono-mcp-server-sse-transport"
import { zValidator } from "@hono/zod-validator"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { authMiddleware } from "./authMiddleware"

export type HonoContext = {
  Variables: {
    accessToken: string
  }
}

const issuerUrl = "https://api.esa.io"

export const honoApp = (config: { mcpServer: McpServer }) => {
  const app = new Hono<HonoContext>()

  app.use(
    cors({
      origin: (origin) => origin,
    })
  )

  const transports: { [sessionId: string]: SSETransport } = {}

  app.get("/health", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() })
  })

  /**
   * このサーバー自身で token, register, authorize などのエンドポイントを proxy したくないので metadata を返す方で実装
   * DCR の未サポートで動かせていないので、各指定が過不足ないかは不明
   */
  app.get("/.well-known/oauth-authorization-server", (c) => {
    return c.json({
      issuer: issuerUrl,
      authorization_endpoint: new URL("/oauth/authorize", issuerUrl).href,
      token_endpoint: new URL("/oauth/token", issuerUrl).href,
      // registration_endpoint: "FIXME", // esa 側でサポートされていない...が、ほぼ必須
      revocation_endpoint: new URL("/oauth/revoke", issuerUrl).href,
      response_types_supported: ["code"],
      response_modes_supported: ["query"],
      grant_types_supported: ["authorization_code"], // ドキュメントでは refresh_token に触れられていないのでおそらくサポートされていない
      code_challenge_methods_supported: ["S256"],
      scopes_supported: ["read", "write"],
    })
  })

  app.get("/sse", authMiddleware, (c) => {
    return streamSSE(c, async (stream) => {
      const transport = new SSETransport("/messages", stream)

      transports[transport.sessionId] = transport

      stream.onAbort(() => {
        delete transports[transport.sessionId]
      })

      await config.mcpServer.connect(transport)
      // keep connection alive
      await new Promise(() => {
        // do not resolve
      })
    })
  })

  app.post(
    "/messages",
    authMiddleware,
    zValidator(
      "query",
      z.object({
        sessionId: z.string(),
      })
    ),
    async (c) => {
      const { sessionId } = c.req.valid("query")
      const transport = transports[sessionId]

      if (transport == null) {
        return c.text("No transport found for sessionId", 400)
      }

      return await transport.handlePostMessage(c)
    }
  )

  return {
    app,
  }
}
