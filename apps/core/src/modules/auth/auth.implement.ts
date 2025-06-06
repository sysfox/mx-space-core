import { IncomingMessage } from 'node:http'
import { MongoClient } from 'mongodb'
import type {
  BetterAuthOptions,
  BetterAuthPlugin,
} from '@mx-space/compiled/auth'
import type { ServerResponse } from 'node:http'

import {
  APIError,
  betterAuth,
  createAuthMiddleware,
  mongodbAdapter,
  toNodeHandler,
} from '@mx-space/compiled/auth'

import { API_VERSION, CROSS_DOMAIN, MONGO_DB } from '~/app.config'
import { SECURITY } from '~/app.config.test'

import {
  AUTH_JS_ACCOUNT_COLLECTION,
  AUTH_JS_SESSION_COLLECTION,
  AUTH_JS_USER_COLLECTION,
} from './auth.constant'

const client = new MongoClient(MONGO_DB.customConnectionString || MONGO_DB.uri)

const db = client.db()

export async function CreateAuth(
  providers: BetterAuthOptions['socialProviders'],
) {
  const auth = betterAuth({
    database: mongodbAdapter(db),
    socialProviders: providers,
    basePath: isDev ? '/auth' : `/api/v${API_VERSION}/auth`,
    trustedOrigins: CROSS_DOMAIN.allowedOrigins.reduce(
      (acc: string[], origin: string) => {
        if (origin.startsWith('http')) {
          return [...acc, origin]
        }
        return [...acc, `https://${origin}`, `http://${origin}`]
      },
      [],
    ),
    account: {
      modelName: AUTH_JS_ACCOUNT_COLLECTION,
      accountLinking: {
        enabled: true,
        trustedProviders: ['google', 'github'],
      },
    },
    session: {
      modelName: AUTH_JS_SESSION_COLLECTION,
    },
    appName: 'mx-core',
    secret: SECURITY.jwtSecret,
    plugins: [
      // @see https://gist.github.com/Bekacru/44cca7b3cf7dcdf1cee431a11d917b87
      {
        id: 'add-account-to-session',
        hooks: {
          after: [
            {
              matcher(context) {
                return context.path.startsWith('/callback')
              },
              handler: createAuthMiddleware(async (ctx) => {
                {
                  let provider = ctx.params.id

                  if (!provider) {
                    if (!ctx.request) {
                      return
                    }
                    const pathname = new URL(ctx.request.url).pathname
                    provider = ctx.params.id || pathname.split('/callback/')[1]
                    if (!provider) {
                      return
                    }
                  }

                  const responseHeader = (ctx.context.returned as any)
                    .headers as Headers

                  let finalSessionId = ''
                  const setSessionToken = responseHeader.get('set-cookie')

                  if (setSessionToken) {
                    const sessionId = setSessionToken
                      .split(';')[0]
                      .split('=')[1]
                      .split('.')[0]

                    if (sessionId) {
                      finalSessionId = sessionId
                    }
                  }

                  await db.collection(AUTH_JS_SESSION_COLLECTION).updateOne(
                    {
                      token: finalSessionId,
                    },
                    { $set: { provider } },
                  )
                }
              }),
            },
          ],
        },
        schema: {
          session: {
            fields: {
              provider: {
                type: 'string',
                required: false,
              },
            },
          },
        },
      } satisfies BetterAuthPlugin,
    ],
    user: {
      modelName: AUTH_JS_USER_COLLECTION,
      additionalFields: {
        isOwner: {
          type: 'boolean',
          defaultValue: false,
          input: false,
        },
        handle: {
          type: 'string',
          defaultValue: '',
        },
      },
    },
  })

  const handler = async (req: IncomingMessage, res: ServerResponse) => {
    try {
      // cors
      res.setHeader(
        'Access-Control-Allow-Origin',
        req.headers.origin || req.headers.referer || req.headers.host || '*',
      )
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
      res.setHeader('Access-Control-Allow-Credentials', 'true')
      res.setHeader('Access-Control-Max-Age', '86400')

      const clonedRequest = new IncomingMessage(req.socket)
      const handler = toNodeHandler(auth)(
        Object.assign(clonedRequest, req, {
          url: req.originalUrl,

          // https://github.com/Bekacru/better-call/blob/main/src/adapter/node.ts
          socket: Object.assign(req.socket, {
            encrypted: isDev ? false : true,
          }),
        }),
        res,
      )

      return handler
    } catch (error) {
      console.error(error)
      // throw error
      res.end(error.message)
    }
  }

  return {
    handler,
    auth: {
      options: auth.options,
      api: {
        getSession(params: Parameters<typeof auth.api.getSession>[0]) {
          return auth.api.getSession(params)
        },
        getProviders() {
          return Object.keys(auth.options.socialProviders || {})
        },
        async listUserAccounts(
          params: Parameters<typeof auth.api.listUserAccounts>[0],
        ) {
          try {
            const result = await auth.api.listUserAccounts(params)
            return result
          } catch (error) {
            if (error instanceof APIError) {
              return null
            }
            throw error
          }
        },
      },
    },
  }
}
