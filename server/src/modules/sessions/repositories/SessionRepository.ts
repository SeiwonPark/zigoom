import { Prisma, Session, User } from '@db/mysql/generated/mysql'

type JoinedSession = Session & { users: User[] }

export default interface SessionRepository {
  save(data: Prisma.SessionCreateInput): Promise<Session>
  save(data: Prisma.SessionCreateInput, include: true): Promise<JoinedSession>

  findById(id: string): Promise<Session | null>
  findById(id: string, include: true): Promise<JoinedSession | null>

  update(id: string, data: Prisma.SessionUpdateInput): Promise<Session>
  update(id: string, data: Prisma.SessionUpdateInput, include: true): Promise<JoinedSession>
}
