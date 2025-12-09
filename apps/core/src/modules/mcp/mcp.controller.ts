import { Controller, Get, Headers, Post, Query, Req, Res } from '@nestjs/common'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { ApiController } from '~/common/decorators/api-controller.decorator'
import { BizException } from '~/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '~/constants/error-code.constant'
import { ConfigsService } from '../configs/configs.service'
import { McpService } from './mcp.service'

@ApiController('mcp')
export class McpController {
  private mcpServer: Server | null = null
  private isInitialized = false
  private initPromise: Promise<void> | null = null

  constructor(
    private readonly mcpService: McpService,
    private readonly configsService: ConfigsService,
  ) {
    // Start initialization but don't await in constructor
    this.initPromise = this.initializeMcpServer()
  }

  private async ensureInitialized() {
    if (!this.isInitialized && this.initPromise) {
      await this.initPromise
    }
  }

  private async initializeMcpServer() {
    this.mcpServer = new Server(
      {
        name: 'mx-space-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    )

    // Register list_tools handler
    this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_post_by_id',
            description: 'Get a post by its ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The post ID',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'get_posts',
            description: 'Get posts with pagination',
            inputSchema: {
              type: 'object',
              properties: {
                page: {
                  type: 'number',
                  description: 'Page number (default: 1)',
                },
                size: {
                  type: 'number',
                  description: 'Page size (default: 10)',
                },
              },
            },
          },
          {
            name: 'get_note_by_id',
            description: 'Get a note by its ID or nid',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: ['string', 'number'],
                  description: 'The note ID or nid',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'get_notes',
            description: 'Get notes with pagination',
            inputSchema: {
              type: 'object',
              properties: {
                page: {
                  type: 'number',
                  description: 'Page number (default: 1)',
                },
                size: {
                  type: 'number',
                  description: 'Page size (default: 10)',
                },
              },
            },
          },
          {
            name: 'get_latest_post',
            description: 'Get the latest post',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_latest_note',
            description: 'Get the latest note',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_all_categories',
            description: 'Get all categories with post counts',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_category_by_id',
            description: 'Get a category by its ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The category ID',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'get_posts_by_category',
            description: 'Get posts in a specific category',
            inputSchema: {
              type: 'object',
              properties: {
                categoryId: {
                  type: 'string',
                  description: 'The category ID',
                },
              },
              required: ['categoryId'],
            },
          },
          {
            name: 'get_tags_summary',
            description: 'Get a summary of all tags and their post counts',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_posts_by_tag',
            description: 'Get posts with a specific tag',
            inputSchema: {
              type: 'object',
              properties: {
                tag: {
                  type: 'string',
                  description: 'The tag name',
                },
              },
              required: ['tag'],
            },
          },
          {
            name: 'get_all_pages',
            description: 'Get all pages',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_page_by_id',
            description: 'Get a page by its ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The page ID',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'get_all_says',
            description: 'Get all says (quotes/status updates)',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_random_say',
            description: 'Get a random say',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_all_recently',
            description: 'Get all recently activities',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_recently_by_id',
            description: 'Get a specific recently activity by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The recently activity ID',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'get_latest_recently',
            description: 'Get the latest recently activity',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_comments',
            description: 'Get comments with pagination',
            inputSchema: {
              type: 'object',
              properties: {
                page: {
                  type: 'number',
                  description: 'Page number (default: 1)',
                },
                size: {
                  type: 'number',
                  description: 'Page size (default: 10)',
                },
                state: {
                  type: 'number',
                  description: 'Comment state filter (0 = all)',
                },
              },
            },
          },
          {
            name: 'get_content_comments',
            description: 'Get comments for a specific content',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The content ID',
                },
                type: {
                  type: 'string',
                  description: 'The content type (post, page, note, etc.)',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'generate_summary',
            description: 'Generate an AI summary for an article (if AI summary via MCP is enabled)',
            inputSchema: {
              type: 'object',
              properties: {
                articleId: {
                  type: 'string',
                  description: 'The article ID',
                },
                lang: {
                  type: 'string',
                  description: 'Target language for the summary (default: auto)',
                },
              },
              required: ['articleId'],
            },
          },
        ],
      }
    })

    // Register call_tool handler
    this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args = {} } = request.params

      try {
        let result: any

        switch (name) {
          case 'get_post_by_id':
            result = await this.mcpService.getPostById(args.id as string)
            break
          case 'get_posts':
            result = await this.mcpService.getPosts(
              args.page as number,
              args.size as number,
            )
            break
          case 'get_note_by_id':
            result = await this.mcpService.getNoteById(
              args.id as string | number,
            )
            break
          case 'get_notes':
            result = await this.mcpService.getNotes(
              args.page as number,
              args.size as number,
            )
            break
          case 'get_latest_post':
            result = await this.mcpService.getLatestPost()
            break
          case 'get_latest_note':
            result = await this.mcpService.getLatestNotes()
            break
          case 'get_all_categories':
            result = await this.mcpService.getAllCategories()
            break
          case 'get_category_by_id':
            result = await this.mcpService.getCategoryById(args.id as string)
            break
          case 'get_posts_by_category':
            result = await this.mcpService.getPostsByCategory(
              args.categoryId as string,
            )
            break
          case 'get_tags_summary':
            result = await this.mcpService.getTagsSummary()
            break
          case 'get_posts_by_tag':
            result = await this.mcpService.getPostsByTag(args.tag as string)
            break
          case 'get_all_pages':
            result = await this.mcpService.getAllPages()
            break
          case 'get_page_by_id':
            result = await this.mcpService.getPageById(args.id as string)
            break
          case 'get_all_says':
            result = await this.mcpService.getAllSays()
            break
          case 'get_random_say':
            result = await this.mcpService.getRandomSay()
            break
          case 'get_all_recently':
            result = await this.mcpService.getAllRecently()
            break
          case 'get_recently_by_id':
            result = await this.mcpService.getRecentlyById(args.id as string)
            break
          case 'get_latest_recently':
            result = await this.mcpService.getLatestRecently()
            break
          case 'get_comments':
            result = await this.mcpService.getComments({
              page: args.page as number,
              size: args.size as number,
              state: args.state as number,
            })
            break
          case 'get_content_comments':
            result = await this.mcpService.getContentComments(
              args.id as string,
              args.type as string,
            )
            break
          case 'generate_summary':
            result = await this.mcpService.generateSummaryViaMcp(
              args.articleId as string,
              (args.lang as string) || 'auto',
            )
            break
          default:
            throw new Error(`Unknown tool: ${name}`)
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        }
      }
    })

    this.isInitialized = true
  }

  private async validateMcpAccess(token?: string) {
    const mcpConfig = await this.configsService.get('mcpOptions')

    if (!mcpConfig?.enable) {
      throw new BizException(ErrorCodeEnum.MCPNotEnabled)
    }

    // For internal use (when public access is disabled), we still require authentication
    // but the token can be empty or match the configured token
    // This allows internal services to access MCP without a token
    if (!mcpConfig.enablePublicAccess) {
      // Internal access - no token validation required
      return
    }

    // If public access is enabled, validate token
    if (!token) {
      throw new BizException(ErrorCodeEnum.Unauthorized)
    }

    if (mcpConfig.accessToken && token !== mcpConfig.accessToken) {
      throw new BizException(ErrorCodeEnum.Unauthorized)
    }
  }

  @Get('/sse')
  async handleSse(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Query('token') token?: string,
    @Headers('authorization') authorization?: string,
  ) {
    // Ensure MCP server is initialized
    await this.ensureInitialized()

    // Extract token from authorization header if present
    const authToken = authorization?.replace('Bearer ', '')
    const accessToken = token || authToken

    await this.validateMcpAccess(accessToken)

    if (!this.mcpServer) {
      throw new BizException(ErrorCodeEnum.ServerError)
    }

    // Set SSE headers before creating transport
    res.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })

    const transport = new SSEServerTransport('/mcp/message', res.raw)
    await this.mcpServer.connect(transport)

    // Handle connection close and errors
    const cleanup = () => {
      transport.close()
    }

    req.raw.on('close', cleanup)
    req.raw.on('error', cleanup)
  }

  @Post('/message')
  async handleMessage(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Query('token') token?: string,
    @Headers('authorization') authorization?: string,
  ) {
    // Ensure MCP server is initialized
    await this.ensureInitialized()

    // Extract token from authorization header if present
    const authToken = authorization?.replace('Bearer ', '')
    const accessToken = token || authToken

    await this.validateMcpAccess(accessToken)

    if (!this.mcpServer) {
      throw new BizException(ErrorCodeEnum.ServerError)
    }

    // This endpoint is used by the SSE transport to send messages
    // The actual handling is done by the transport
    res.status(200).send({ ok: true })
  }
}
