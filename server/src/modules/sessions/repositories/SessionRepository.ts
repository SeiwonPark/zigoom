import { Prisma, Session, User } from '@db/mysql/generated/mysql'

export type JoinedSession = Session & { users: User[] }

export default interface SessionRepository {
  save(data: Prisma.SessionCreateInput, include?: boolean): Promise<Session | JoinedSession>

  findById(id: string, include?: boolean): Promise<Session | JoinedSession | null>

  update(id: string, data: Prisma.SessionUpdateInput, include?: boolean): Promise<Session | JoinedSession>
}
