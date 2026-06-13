import fs from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'

import {
  Body,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { lookup } from 'mime-types'

import { ApiController } from '~/common/decorators/api-controller.decorator'
import { Auth } from '~/common/decorators/auth.decorator'
import { HTTPDecorators } from '~/common/decorators/http.decorator'
import { AppErrorCode, createAppException } from '~/common/errors'
import { withMeta } from '~/common/response/envelope.types'
import { MetaObjectBuilder } from '~/common/response/meta-builder'
import { STATIC_FILE_DIR } from '~/constants/path.constant'
import { ConfigsService } from '~/modules/configs/configs.service'
import { UploadService } from '~/processors/helper/helper.upload.service'
import { BasicPagerDto } from '~/shared/dto/pager.dto'
import {
  generateFilename,
  generateFilePath,
  replaceFilenameTemplate,
} from '~/utils/filename-template.util'
import { S3Uploader } from '~/utils/s3.util'

import {
  BatchOrphanDeleteDto,
  CommentUploadsListQueryDto,
  FileQueryDto,
  FileUploadDto,
  RenameFileQueryDto,
} from './file.schema'
import { FileService } from './file.service'
import { FileReferenceService } from './file-reference.service'
import { FileDeletionReason } from './file-reference.types'
import { ImageCompressionService } from './image-compression.service'

@ApiController(['objects', 'files'])
export class FileController {
  constructor(
    private readonly service: FileService,
    private readonly uploadService: UploadService,
    private readonly fileReferenceService: FileReferenceService,
    private readonly configsService: ConfigsService,
    private readonly imageCompressionService: ImageCompressionService,
  ) {}

  @Delete('/orphans/batch')
  @Auth()
  async batchDeleteOrphans(@Body() body: BatchOrphanDeleteDto) {
    return this.fileReferenceService.batchDeleteOrphans(body)
  }

  @Get('/orphans/list')
  @Auth()
  async getOrphanFiles(@Query() query: BasicPagerDto) {
    const { page = 1, size = 20 } = query
    const { data: files, pagination } =
      await this.fileReferenceService.listOrphanFiles(page, size)

    return withMeta(
      files.map((file) => ({
        id: file.id,
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        status: file.status,
        uploadedBy: file.uploadedBy,
        readerId: file.readerId,
        mimeType: file.mimeType,
        byteSize: file.byteSize,
        refType: file.refType,
        refId: file.refId,
        detachedAt: file.detachedAt,
        createdAt: file.createdAt,
      })),
      new MetaObjectBuilder().pagination(pagination).build(),
    )
  }

  @Get('/orphans/count')
  @Auth()
  async getOrphanFilesCount() {
    const count = await this.fileReferenceService.getOrphanFilesCount()
    return { count }
  }

  @Post('/orphans/cleanup')
  @Auth()
  async cleanupOrphanFiles(@Query('maxAgeMinutes') maxAgeMinutes?: number) {
    return this.fileReferenceService.cleanupOrphanFiles(maxAgeMinutes || 60)
  }

  @Get('/comment-uploads/list')
  @Auth()
  async getCommentUploads(@Query() query: CommentUploadsListQueryDto) {
    const { page, size, status, readerId, refId } = query
    const { files, total } = await this.fileReferenceService.listReaderUploads({
      page,
      size,
      status,
      readerId,
      refId,
    })

    return withMeta(
      files.map((file) => ({
        id: file.id,
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        status: file.status,
        readerId: file.readerId,
        mimeType: file.mimeType,
        byteSize: file.byteSize,
        refType: file.refType,
        refId: file.refId,
        detachedAt: file.detachedAt,
        createdAt: file.createdAt,
      })),
      new MetaObjectBuilder()
        .pagination({
          page,
          size,
          total,
          totalPages: Math.ceil(total / size),
        })
        .build(),
    )
  }

  @Delete('/comment-uploads/:id')
  @Auth()
  async deleteCommentUpload(@Param('id') id: string) {
    const file = await this.fileReferenceService.getReferenceById(id)
    if (!file) {
      throw createAppException(AppErrorCode.FILE_NOT_FOUND, { name: id })
    }
    const { storageRemoved } = await this.fileReferenceService.hardDeleteFile(
      file,
      FileDeletionReason.Manual,
    )
    return { storageRemoved }
  }

  @Get('/:type')
  @Auth()
  async getTypes(
    @Query() query: BasicPagerDto,
    @Param() params: FileUploadDto,
  ) {
    const { type = 'file' } = params
    const dir = await this.service.getDir(type)
    const files = await Promise.all(
      dir.map(async (name) => {
        const { birthtime } = await fs.stat(
          path.resolve(STATIC_FILE_DIR, type, name),
        )
        return {
          name,
          url: await this.service.resolveFileUrl(type, name),
          created: +birthtime,
        }
      }),
    )
    return files.sort((a, b) => b.created - a.created)
  }

  @Get('/:type/:name')
  @Throttle({
    default: {
      limit: 60,
      ttl: 60_000,
    },
  })
  @HTTPDecorators.RawResponse
  async get(@Param() params: FileQueryDto, @Res() reply: FastifyReply) {
    const { type, name } = params
    const ext = path.extname(name)
    const mimetype = lookup(ext)

    try {
      const stream = await this.service.getFileStream(type, name)
      if (mimetype) {
        reply.type(mimetype)
        reply.header('cache-control', 'public, max-age=31536000')
        reply.header(
          'expires',
          new Date(Date.now() + 31536000 * 1000).toUTCString(),
        )
      }

      return reply.send(stream)
    } catch {
      throw createAppException(AppErrorCode.FILE_NOT_FOUND, { name })
    }
  }

  @Post('/upload')
  @Auth()
  async upload(@Query() query: FileUploadDto, @Req() req: FastifyRequest) {
    const { type = 'file' } = query

    const uploadConfig = await this.configsService.get('fileUploadOptions')
    const imageStorageConfig = await this.configsService.get(
      'imageStorageOptions',
    )
    const s3Enabled = imageStorageConfig?.enable === true

    const uploadToS3 = async () => {
      const config = imageStorageConfig!
      if (
        !config.endpoint ||
        !config.secretId ||
        !config.secretKey ||
        !config.bucket
      ) {
        throw createAppException(AppErrorCode.FILE_STORAGE_NOT_CONFIGURED)
      }

      const file = await this.uploadService.getAndValidMultipartField(
        req,
        type === 'video'
          ? { maxFileSize: Number.MAX_SAFE_INTEGER }
          : { maxFileSize: 20 * 1024 * 1024 },
      )

      const filename = generateFilename(uploadConfig, {
        originalFilename: file.filename,
        fileType: type,
      })

      let prefixPath = ''
      if (config.prefix) {
        prefixPath = replaceFilenameTemplate(config.prefix, {
          originalFilename: file.filename,
          fileType: type,
        })
        prefixPath = prefixPath.replace(/\/+$/, '')
      }

      const objectKey = prefixPath ? `${prefixPath}/${filename}` : filename

      const s3Uploader = new S3Uploader({
        endpoint: config.endpoint,
        accessKey: config.secretId,
        secretKey: config.secretKey,
        bucket: config.bucket,
        region: config.region || 'auto',
      })
      if (config.customDomain) {
        s3Uploader.setCustomDomain(config.customDomain)
      }

      const contentType = lookup(file.filename) || 'application/octet-stream'

      let s3Url: string
      let s3Filename = filename
      let s3ObjectKey = objectKey
      let s3ContentType = contentType
      if (type === 'video') {
        s3Url = await s3Uploader.uploadStream(
          file.file,
          s3ObjectKey,
          s3ContentType,
        )
      } else {
        const chunks: Buffer[] = []
        for await (const chunk of file.file) {
          chunks.push(chunk)
        }
        let buffer = Buffer.concat(chunks)

        if (type === 'image') {
          const compressed = await this.imageCompressionService.compress(buffer)
          if (compressed) {
            buffer = compressed.data
            s3Filename = filename.replace(/\.[^.]+$/, '') + compressed.ext
            s3ObjectKey = prefixPath
              ? `${prefixPath}/${s3Filename}`
              : s3Filename
            s3ContentType = compressed.mime
          }
        }

        s3Url = await s3Uploader.uploadBuffer(
          buffer,
          s3ObjectKey,
          s3ContentType,
        )
      }

      await this.fileReferenceService.createPendingReference(
        s3Url,
        s3Filename,
        s3ObjectKey,
      )

      return { url: s3Url, name: s3Filename }
    }

    if (
      s3Enabled &&
      (type === 'image' || type === 'file' || type === 'video')
    ) {
      return uploadToS3()
    }

    const file = await this.uploadService.getAndValidMultipartField(
      req,
      type === 'image'
        ? {
            maxFileSize: 20 * 1024 * 1024,
          }
        : type === 'video'
          ? {
              maxFileSize: (uploadConfig.videoMaxSize ?? 100) * 1024 * 1024,
            }
          : undefined,
    )

    const rawFilename = generateFilename(uploadConfig, {
      originalFilename: file.filename,
      fileType: type,
    })

    const basePath = generateFilePath(uploadConfig, {
      originalFilename: file.filename,
      fileType: type,
    })

    let relativePath: string
    if (basePath === type || !basePath) {
      relativePath = rawFilename
    } else {
      const pathWithoutType = basePath.startsWith(`${type}/`)
        ? basePath.slice(Math.max(0, type.length + 1))
        : basePath
      relativePath = path.join(pathWithoutType, rawFilename)
    }

    // Buffer the stream first so we can process (compress) it before writing
    const chunks: Buffer[] = []
    let totalBytes = 0
    const maxSize =
      type === 'video'
        ? (uploadConfig.videoMaxSize ?? 100) * 1024 * 1024
        : type === 'image'
          ? 20 * 1024 * 1024
          : Number.MAX_SAFE_INTEGER
    for await (const chunk of file.file) {
      chunks.push(chunk)
      totalBytes += chunk.length
      if (totalBytes > maxSize) {
        throw createAppException(AppErrorCode.FILE_TOO_LARGE)
      }
    }

    if (file.file.truncated) {
      throw createAppException(AppErrorCode.FILE_TOO_LARGE)
    }

    let imageBuffer = Buffer.concat(chunks)
    let finalRelativePath = relativePath

    if (type === 'image') {
      const compressed =
        await this.imageCompressionService.compress(imageBuffer)
      if (compressed) {
        imageBuffer = compressed.data
        const compressedName =
          rawFilename.replace(/\.[^.]+$/, '') + compressed.ext
        if (basePath === type || !basePath) {
          finalRelativePath = compressedName
        } else {
          const pWithoutType = basePath.startsWith(`${type}/`)
            ? basePath.slice(Math.max(0, type.length + 1))
            : basePath
          finalRelativePath = path.join(pWithoutType, compressedName)
        }
      }
    }

    await this.service.writeFile(
      type,
      finalRelativePath,
      Readable.from(imageBuffer),
    )
    const fileUrl = await this.service.resolveFileUrl(type, finalRelativePath)
    if (type === 'image') {
      await this.fileReferenceService.createPendingReference(
        fileUrl,
        finalRelativePath,
      )
    }

    return { url: fileUrl, name: path.basename(finalRelativePath) }
  }

  @Put('/:type/:name')
  @Auth()
  async update(@Param() params: FileQueryDto, @Req() req: FastifyRequest) {
    const { type, name } = params
    const file = await this.uploadService.getAndValidMultipartField(req)
    await this.service.updateFile(type, name, file.file)
    const fileUrl = await this.service.resolveFileUrl(type, name)
    return { url: fileUrl, name }
  }

  @Delete('/:type/:name')
  @Auth()
  async delete(@Param() params: FileQueryDto) {
    const { type, name } = params
    await this.service.deleteFile(type, name)
  }

  @Auth()
  @Patch('/:type/:name/rename')
  async rename(
    @Param() params: FileQueryDto,
    @Query() query: RenameFileQueryDto,
  ) {
    const { type, name } = params
    const { newName } = query
    await this.service.renameFile(type, name, newName)
  }
}
