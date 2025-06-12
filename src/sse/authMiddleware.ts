import { createMiddleware } from "hono/factory"
import { HonoContext } from "./hono"

class InvalidTokenError extends Error {
  public readonly errorCode: string

  constructor(message: string, errorCode: string = "invalid_token") {
    super(message)
    this.name = "InvalidTokenError"
    this.errorCode = errorCode
  }

  toResponseObject() {
    return {
      error: this.errorCode,
      error_description: this.message,
    }
  }
}

class ServerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ServerError"
  }

  toResponseObject() {
    return {
      error: "server_error",
      error_description: this.message,
    }
  }
}

export const authMiddleware = createMiddleware<HonoContext>(async (c, next) => {
  try {
    const header = c.req.header("authorization")
    if (!header) {
      throw new InvalidTokenError("Missing Authorization header")
    }

    const [type, token] = header.split(" ")
    if (type.toLowerCase() !== "bearer" || !token) {
      throw new InvalidTokenError(
        "Invalid Authorization header format, expected 'Bearer TOKEN'"
      )
    }

    c.set("accessToken", token)
    await next()
  } catch (error) {
    if (error instanceof InvalidTokenError) {
      return c.json(error.toResponseObject(), 401, {
        "WWW-Authenticate": `Bearer error="${error.errorCode}", error_description="${error.message}"`,
      })
    } else {
      console.error("Unexpected error authenticating bearer token:", error)
      return c.json(
        new ServerError("Internal Server Error").toResponseObject(),
        500
      )
    }
  }
})
