import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { createServer } from "./server"

const main = async () => {
  const { server } = createServer()

  const transport = new StdioServerTransport()
  await server.connect(transport)
}

await main()
