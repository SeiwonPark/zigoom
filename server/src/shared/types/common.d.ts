import type { Guest } from '@shared/infra/http/middlewares/handlers'

import type { TokenPayload } from 'google-auth-library'

export type Token = TokenPayload & Guest
