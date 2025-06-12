import { z } from "zod"
import { orderSchema, sortSchema } from "./schema"
import {
  deleteV1TeamsTeamNamePostsPostNumber,
  getV1TeamsTeamNamePosts,
  getV1TeamsTeamNamePostsPostNumber,
  patchV1TeamsTeamNamePostsPostNumber,
  postV1TeamsTeamNamePosts,
} from "./generated/esa-api/esaAPI"
import { getRequiredEnv } from "./env"

export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ApiError"
  }
}

type PostInput = {
  name: string
  wip: boolean
  message?: string | undefined
  body_md?: string | undefined
  tags?: string[] | undefined
  category?: string | undefined
}

export class ApiClient {
  constructor(private apiKey: string) {}

  private async callApi<T extends { status: number; data: unknown }>(
    cb: () => Promise<T>
  ) {
    const response = await cb()
    if (
      response.status === 200 ||
      response.status === 201 ||
      response.status === 204
    ) {
      return response as T extends { status: 200 | 201 | 204 } ? T : never
    } else {
      if (
        typeof response.data === "object" &&
        response.data !== null &&
        "message" in response.data &&
        typeof response.data.message === "string"
      ) {
        throw new ApiError(response.data.message)
      }

      throw new ApiError(`Api Error: ${response.status}`)
    }
  }

  async searchPosts(
    teamName: string,
    query: string,
    order: z.infer<typeof orderSchema>,
    sort: z.infer<typeof sortSchema>,
    page: number,
    perPage: number
  ) {
    const response = await this.callApi(() =>
      getV1TeamsTeamNamePosts(
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
            Authorization: `Bearer ${getRequiredEnv("ESA_API_KEY")}`,
          },
        }
      )
    )

    // esa 的には取ってきちゃうが、LLM が呼むのに全文は大きすぎるので外す
    const posts = (response.data.posts ?? []).map(
      ({ body_html, body_md, ...others }) => others
    )

    return posts
  }

  async readPosts(teamName: string, postNumbers: readonly number[]) {
    return await Promise.all(
      postNumbers.map(async (postNumber) => {
        const response = await this.callApi(() =>
          getV1TeamsTeamNamePostsPostNumber(
            teamName,
            postNumber,
            {},
            {
              headers: {
                Authorization: `Bearer ${this.apiKey}`,
              },
            }
          )
        )
        const { body_html, ...others } = response.data
        return others
      })
    )
  }

  async createPost(teamName: string, post: PostInput) {
    return this.callApi(() =>
      postV1TeamsTeamNamePosts(
        teamName,
        {
          post,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      )
    ).then((response) => response.data)
  }

  async updatePost(
    teamName: string,
    postNumber: number,
    post: Partial<PostInput>
  ) {
    return this.callApi(() =>
      patchV1TeamsTeamNamePostsPostNumber(
        teamName,
        postNumber,
        { post },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      )
    ).then((response) => response.data)
  }

  async deletePost(teamName: string, postNumber: number) {
    return this.callApi(() =>
      deleteV1TeamsTeamNamePostsPostNumber(teamName, postNumber, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })
    ).then((response) => response.data)
  }
}
