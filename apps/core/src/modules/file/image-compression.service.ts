import { Injectable, Logger } from '@nestjs/common'
import sharp from 'sharp'

import { ConfigsService } from '~/modules/configs/configs.service'
import { detectImageType } from '~/utils/image.util'

export const TARGET_FORMATS = ['jpeg', 'png', 'webp', 'avif'] as const
export type TargetFormat = (typeof TARGET_FORMATS)[number]

const DEFAULT_WHITELIST = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/tiff',
]

export interface ImageCompressionConfig {
  enable?: boolean
  whitelist?: string[]
  targetFormat?: TargetFormat
  quality?: number
  maxWidth?: number
  maxHeight?: number
}

export function getMimeFromTargetFormat(format: TargetFormat): string {
  const map: Record<TargetFormat, string> = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    avif: 'image/avif',
  }
  return map[format]
}

export function getExtFromTargetFormat(format: TargetFormat): string {
  const map: Record<TargetFormat, string> = {
    jpeg: '.jpg',
    png: '.png',
    webp: '.webp',
    avif: '.avif',
  }
  return map[format]
}

@Injectable()
export class ImageCompressionService {
  private readonly logger = new Logger(ImageCompressionService.name)

  constructor(private readonly configsService: ConfigsService) {}

  /**
   * Compress / convert an image buffer using sharp.
   * Returns the processed buffer and new MIME type, or null if compression is
   * disabled, the input format is not whitelisted, or processing fails.
   */
  async compress(
    buffer: Buffer,
  ): Promise<{ data: Buffer; mime: string; ext: string } | null> {
    const config: ImageCompressionConfig = await this.configsService.get(
      'imageCompressionOptions',
    )
    if (!config?.enable) return null

    const detected = detectImageType(buffer)
    if (!detected) return null

    const whitelist: string[] =
      config.whitelist && config.whitelist.length > 0
        ? config.whitelist
        : DEFAULT_WHITELIST
    if (
      !whitelist.some((m) => m.toLowerCase() === detected.mime.toLowerCase())
    ) {
      return null
    }

    const targetFormat: TargetFormat = config.targetFormat || 'webp'
    const quality = config.quality ?? 80

    try {
      let pipeline = sharp(buffer)

      if (config.maxWidth || config.maxHeight) {
        pipeline = pipeline.resize({
          width: config.maxWidth || undefined,
          height: config.maxHeight || undefined,
          fit: 'inside',
          withoutEnlargement: true,
        })
      }

      switch (targetFormat) {
        case 'jpeg': {
          pipeline = pipeline.jpeg({ quality, mozjpeg: true })
          break
        }
        case 'png': {
          pipeline = pipeline.png({ quality })
          break
        }
        case 'webp': {
          pipeline = pipeline.webp({ quality })
          break
        }
        case 'avif': {
          pipeline = pipeline.avif({ quality })
          break
        }
      }

      const data = await pipeline.toBuffer()
      return {
        data,
        mime: getMimeFromTargetFormat(targetFormat),
        ext: getExtFromTargetFormat(targetFormat),
      }
    } catch (error) {
      this.logger.error(`Image compression failed: ${error.message}`, error)
      return null
    }
  }
}
