import { Prisma, Session } from '../../../../prisma/mysql/generated/mysql'

export default interface SessionRepository {
  save(data: Prisma.SessionCreateInput): Promise<Session>
}
