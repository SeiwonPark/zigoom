import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '@configs/bucket.config'
import { AWS_BUCKET, AWS_REGION } from '@configs/env.config'
import { logger } from '@configs/logger.config'
import { ErrorCode, RequestError } from '@shared/errors'

interface Image {
  url: string
}

interface RequestPayload {
  files: Express.Multer.File[]
  paths: string[]
}

export default class UploadMultipleImageService {
  /**
   * Currently this doesn't consider the images orders.
   */
  public async execute({ files, paths }: RequestPayload): Promise<Image[]> {
    return await Promise.all(
      files.map((file, index) => {
        const filePath = paths[index]
        return this.uploadToS3(file.buffer, filePath!)
      })
    )
  }

  private async uploadToS3(buffer: Buffer, path: string): Promise<Image> {
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: AWS_BUCKET,
          Key: path,
          Body: buffer,
          ACL: 'public-read',
        })
      )

      return { url: `https://${AWS_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${path}` }
    } catch (error) {
      logger.error(`Failed to upload image for ${path}: ${error}`)
      throw new RequestError(`Failed to upload image for ${path}`, ErrorCode.InternalServerError)
    }
  }
}
