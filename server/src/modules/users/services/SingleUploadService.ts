import fetch from 'node-fetch'
import { injectable } from 'tsyringe'

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '@configs/bucket.config'
import { AWS_BUCKET, AWS_REGION } from '@configs/env.config'
import { logger } from '@configs/logger.config'
import { ErrorCode, RequestError } from '@shared/errors'

interface RequestPayload {
  file: Buffer
  path: string
}

@injectable()
export default class SingleUploadService {
  public async execute({ file, path }: RequestPayload): Promise<string | undefined> {
    return await this.uploadImage(file, path)
  }

  private async uploadImage(buffer: Buffer, path: string): Promise<string | undefined> {
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: AWS_BUCKET,
          Key: path,
          Body: buffer,
          ACL: 'public-read',
        })
      )
    } catch {
      logger.error(`Failed to upload image for ${path}`)
      throw new RequestError(`Failed to upload image for ${path}`, ErrorCode.InternalServerError)
    }

    return `https://${AWS_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${path}`
  }

  public async uploadImageFromUrl(url: string, path: string): Promise<string | undefined> {
    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new RequestError(`Failed to upload image from URL`, ErrorCode.InternalServerError)
      }

      const buffer = await response.buffer()
      return this.uploadImage(buffer, path)
    } catch (error) {
      logger.error(`Failed to upload image from URL: ${error}`)
      throw new RequestError(`Failed to upload image from URL`, ErrorCode.InternalServerError)
    }
  }
}
