#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import {
  getV1TeamsTeamNamePosts,
  getV1TeamsTeamNamePostsPostNumber,
  postV1TeamsTeamNamePosts,
  patchV1TeamsTeamNamePostsPostNumber,
  deleteV1TeamsTeamNamePostsPostNumber,
} from "./generated/esa-api/esaAPI"
import { version } from "../package.json"
import { Post } from "./generated/esa-api/esaAPI.schemas"

const env = z
  .object({
    ESA_API_KEY: z.string(),
    DEFAULT_ESA_TEAM: z.string(),
  })
  .parse(process.env)

const server = new McpServer({
  name: "esa-server",
  version: version,
})

const orderSchema = z
  .union([z.literal("asc"), z.literal("desc")])
  .default("desc")

const sortSchema = z
  .union([
    z.literal("created"),
    z.literal("updated"),
    z.literal("number"),
    z.literal("stars"),
    z.literal("comments"),
    z.literal("best_match"),
  ])
  .default("best_match")

server.tool(
  "search_esa_posts",
  "Search posts in esa.io. Response is paginated. " +
    "For efficient search, you can use customized queries like the following: " +
    'keyword for partial match, "keyword" for exact match, ' +
    "keyword1 keyword2 for AND match, " +
    "keyword1 OR keyword2 for OR match, " +
    "-keyword for excluding keywords, " +
    "title:keyword for title match, " +
    "wip:true or wip:false for WIP posts, " +
    "kind:stock or kind:flow for kind match, " +
    "category:category_name for partial match with category name, " +
    "in:category_name for prefix match with category name, " +
    "on:category_name for exact match with category name, " +
    "body:keyword for body match, " +
    "tag:tag_name or tag:tag_name case_sensitive:true for tag match, " +
    "user:screen_name for post author's screen name, " +
    "updated_by:screen_name for post updater's screen name, " +
    "comment:keyword for partial match with comments, " +
    "starred:true or starred:false for starred posts, " +
    "watched:true or watched:false for watched posts, " +
    "watched_by:screen_name for screen name of members watching the post, " +
    "sharing:true or sharing:false for shared posts, " +
    "stars:>3 for posts with more than 3 stars, " +
    "watches:>3 for posts with more than 3 watches, " +
    "comments:>3 for posts with more than 3 comments, " +
    "done:>=3 for posts with 3 or more done items, " +
    "undone:>=3 for posts with 3 or more undone items, " +
    "created:>YYYY-MM-DD for filtering by creation date, " +
    "updated:>YYYY-MM-DD for filtering by update date",
  {
    teamName: z.string().default(env.DEFAULT_ESA_TEAM),
    query: z.string(),
    order: orderSchema,
    sort: sortSchema,
    page: z.number().min(1).default(1),
    perPage: z.number().min(1).max(100).default(50),
  },
  async (input) => {
    const posts = await fetchPosts(
      input.teamName,
      input.query,
      input.order,
      input.sort,
      input.page,
      input.perPage
    )

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            posts: posts,
            nextPage: input.page + 1,
          }),
        },
      ],
    }
  }
)

server.tool(
  "read_esa_post",
  "Read a post in esa.io.",
  {
    teamName: z.string().default(env.DEFAULT_ESA_TEAM),
    postNumber: z.number(),
  },
  async (input) => {
    const response = await getV1TeamsTeamNamePostsPostNumber(
      env.DEFAULT_ESA_TEAM,
      input.postNumber,
      {},
      {
        headers: {
          Authorization: `Bearer ${env.ESA_API_KEY}`,
        },
      }
    )
    const { body_html, ...others } = response.data

    return {
      content: [{ type: "text", text: JSON.stringify(others) }],
    }
  }
)

server.tool(
  "read_esa_multiple_posts",
  "Read multiple posts in esa.io.",
  {
    teamName: z.string().default(env.DEFAULT_ESA_TEAM),
    postNumbers: z.array(z.number()),
  },
  async (input) => {
    const multiplePosts = await Promise.all(
      input.postNumbers.map(async (postNumber) => {
        const response = await getV1TeamsTeamNamePostsPostNumber(
          env.DEFAULT_ESA_TEAM,
          postNumber,
          {},
          {
            headers: {
              Authorization: `Bearer ${env.ESA_API_KEY}`,
            },
          }
        )
        const { body_html, ...others } = response.data

        return others
      })
    )

    return {
      content: [{ type: "text", text: JSON.stringify(multiplePosts) }],
    }
  }
)

server.tool(
  "create_esa_post",
  "Create a new post in esa.io. Required parameters: name. Optional parameters: body_md, tags, category, wip (default: true), message.",
  {
    teamName: z.string().default(env.DEFAULT_ESA_TEAM),
    name: z.string(),
    body_md: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    wip: z.boolean().default(true),
    message: z.string().optional(),
  },
  async (input) => {
    const { teamName: createTeamName, ...postData } = input
    const createResponse = await postV1TeamsTeamNamePosts(
      createTeamName,
      { post: postData },
      {
        headers: {
          Authorization: `Bearer ${env.ESA_API_KEY}`,
        },
      }
    )

    return {
      content: [{ type: "text", text: JSON.stringify(createResponse.data) }],
    }
  }
)
server.tool(
  "update_esa_post",
  "Update an existing post in esa.io. Required parameters: postNumber. Optional parameters: name, body_md, tags, category, wip, message.",
  {
    teamName: z.string().default(env.DEFAULT_ESA_TEAM),
    postNumber: z.number(),
    name: z.string().optional(),
    body_md: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    wip: z.boolean().optional(),
    message: z.string().optional(),
  },
  async (input) => {
    const { teamName: updateTeamName, postNumber, ...updateData } = input
    const updateResponse = await patchV1TeamsTeamNamePostsPostNumber(
      updateTeamName,
      postNumber,
      { post: updateData },
      {
        headers: {
          Authorization: `Bearer ${env.ESA_API_KEY}`,
        },
      }
    )

    return {
      content: [{ type: "text", text: JSON.stringify(updateResponse.data) }],
    }
  }
)
server.tool(
  "delete_esa_post",
  "Delete a post in esa.io. Required parameters: postNumber.",
  {
    teamName: z.string().default(env.DEFAULT_ESA_TEAM),
    postNumber: z.number(),
  },
  async (input) => {
    await deleteV1TeamsTeamNamePostsPostNumber(
      input.teamName,
      input.postNumber,
      {
        headers: {
          Authorization: `Bearer ${env.ESA_API_KEY}`,
        },
      }
    )

    return {
      content: [{ type: "text", text: JSON.stringify({ success: true }) }],
    }
  }
)

const fetchPosts = async (
  teamName: string,
  query: string,
  order: z.infer<typeof orderSchema>,
  sort: z.infer<typeof sortSchema>,
  page: number,
  perPage: number
): Promise<Omit<Post, "body_html" | "body_md">[]> => {
  const response = await getV1TeamsTeamNamePosts(
    teamName,
    {
      q: query,
      order: order,
      sort: sort,
      page: page,
      per_page: perPage,
    },
    {
      headers: {
        Authorization: `Bearer ${env.ESA_API_KEY}`,
      },
    }
  )

  // esa 的には取ってきちゃうが、LLM が呼むのに全文は大きすぎるので外す
  const posts = (response.data.posts ?? []).map(
    ({ body_html, body_md, ...others }) => others
  )

  return posts
}

const transport = new StdioServerTransport()
await server.connect(transport)
