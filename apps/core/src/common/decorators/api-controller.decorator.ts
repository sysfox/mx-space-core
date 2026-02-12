import type { ControllerOptions } from '@nestjs/common'
import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { API_VERSION } from '~/app.config'
import { isDev } from '~/global/env.global'

export const apiRoutePrefix = isDev ? '' : `/api/v${API_VERSION}`
export const ApiController: (
  optionOrString?: string | string[] | undefined | ControllerOptions,
) => ReturnType<typeof Controller> = (...rest) => {
  const [controller, ...args] = rest
  if (!controller) {
    return Controller(apiRoutePrefix)
  }

  const transformPath = (path: string) =>
    `${apiRoutePrefix}/${path.replace(/^\/*/, '')}`

  // Extract tag name from path for Swagger
  const getTagName = (path: string | string[]): string => {
    const firstPath = Array.isArray(path) ? path[0] : path
    const cleaned = firstPath.replace(/^\/*/, '').split('/')[0]
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  }

  if (typeof controller === 'string') {
    const tagName = getTagName(controller)
    const transformedPath = transformPath(controller)
    const ControllerDecorator = Controller(transformedPath, ...args)
    const TagDecorator = ApiTags(tagName)
    return (target: any) => {
      ControllerDecorator(target)
      TagDecorator(target)
    }
  } else if (Array.isArray(controller)) {
    const tagName = getTagName(controller)
    const transformedPaths = controller.map((path) => transformPath(path))
    const ControllerDecorator = Controller(transformedPaths, ...args)
    const TagDecorator = ApiTags(tagName)
    return (target: any) => {
      ControllerDecorator(target)
      TagDecorator(target)
    }
  } else {
    const path = controller.path || ''
    const tagName = getTagName(path)
    const transformedPath = Array.isArray(path)
      ? path.map((i) => transformPath(i))
      : transformPath(path)
    const ControllerDecorator = Controller(transformedPath, ...args)
    const TagDecorator = ApiTags(tagName)
    return (target: any) => {
      ControllerDecorator(target)
      TagDecorator(target)
    }
  }
}
