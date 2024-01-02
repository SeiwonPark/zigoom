import { S3Client } from '@aws-sdk/client-s3'

import { AWS_ACCESS_KEY_ID, AWS_ACCESS_SECRET_KEY, AWS_REGION } from './env.config'

export const s3 = new S3Client({
  region: AWS_REGION,
  credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_ACCESS_SECRET_KEY },
})
