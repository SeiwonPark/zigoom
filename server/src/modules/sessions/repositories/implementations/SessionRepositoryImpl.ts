import { Prisma, Session, User } from '@db/mysql/generated/mysql'
import { mysql } from '@configs/prisma.config'
import SessionRepository from '../SessionRepository'

type JoinedSession = Session & { users: User[] }

export default class SessionRepositoryImpl implements SessionRepository {
  public async save(data: Prisma.SessionCreateInput): Promise<Session>
  public async save(data: Prisma.SessionCreateInput, include: true): Promise<JoinedSession>
  public async save(data: Prisma.SessionCreateInput, include?: boolean): Promise<Session | JoinedSession> {
    return await mysql.session.create({ data: data, include: { users: include ?? false } })
  }

  public async findById(id: string): Promise<Session | null>
  public async findById(id: string, include: true): Promise<JoinedSession | null>
  public async findById(id: string, include?: boolean): Promise<Session | JoinedSession | null> {
    return await mysql.session.findUnique({ where: { id: id }, include: { users: include ?? false } })
  }

  public async update(id: string, data: Prisma.SessionUpdateInput): Promise<Session>
  public async update(id: string, data: Prisma.SessionUpdateInput, include: true): Promise<JoinedSession>
  public async update(
    id: string,
    data: Prisma.SessionUpdateInput,
    include?: boolean,
  ): Promise<Session | JoinedSession> {
    return await mysql.session.update({ where: { id: id }, data: data, include: { users: include ?? false } })
  }
}
