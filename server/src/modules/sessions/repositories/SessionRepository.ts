import { Prisma, Session, User } from '@db/mysql/generated/mysql'

export type JoinedSession = Session & { users: User[] }

export default interface SessionRepository {
  save(data: Prisma.SessionCreateInput): Promise<Session>
  save(data: Prisma.SessionCreateInput, include: true): Promise<JoinedSession>
  save(data: Prisma.SessionCreateInput, include?: boolean): Promise<Session | JoinedSession>

  findById(id: string): Promise<Session | null>
  findById(id: string, include: true): Promise<JoinedSession | null>
  findById(id: string, include?: boolean): Promise<Session | JoinedSession | null>

  update(id: string, data: Prisma.SessionUpdateInput): Promise<Session>
  update(id: string, data: Prisma.SessionUpdateInput, include: true): Promise<JoinedSession>
  update(id: string, data: Prisma.SessionUpdateInput, include?: boolean): Promise<Session | JoinedSession>

  deleteById(id: string): Promise<Session>
}
