#!/usr/bin/env node

import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { serve } from "@hono/node-server"
import { createServer } from "./server"
import { honoApp } from "./sse/hono"

const main = async () => {
  const argv = await yargs(hideBin(process.argv))
    .option("sse", {
      type: "boolean",
      description:
        "Enable Server-Sent Events transport with OAuth authentication",
      default: false,
    })
    .option("port", {
      type: "number",
      description: "Port for HTTP server (required with --sse)",
      default: 3000,
    })
    .option("oauth-setup", {
      type: "boolean",
      description: "Run OAuth setup wizard",
      default: false,
    })
    .help().argv

  // TODO: OAuth なら accessToken を使うようにしないと
  const { server } = createServer()

  switch (true) {
    case argv.sse: {
      const { app } = honoApp({
        mcpServer: server,
      })

      serve({
        fetch: app.fetch,
        port: argv.port,
        hostname: "0.0.0.0",
      })

      console.log(`Server running on 0.0.0.0:${argv.port}`)
      console.log(`SSE endpoint: http://0.0.0.0:${argv.port}/sse`)
      console.log(`Health check: http://0.0.0.0:${argv.port}/health`)
      break
    }

    default: {
      // Standard stdio mode (default)
      const transport = new StdioServerTransport()
      await server.connect(transport)
    }
  }
}

await main().catch(console.error)
