import { Prisma, Session } from '@db/mysql/generated/mysql'
import { mysql } from '@configs/prisma.config'
import SessionRepository, { JoinedSession } from '../SessionRepository'

export default class SessionRepositoryImpl implements SessionRepository {
  public async save(data: Prisma.SessionCreateInput, include?: boolean): Promise<Session | JoinedSession> {
    return await mysql.session.create({ data: data, include: { users: include ?? false } })
  }

  public async findById(id: string, include?: boolean): Promise<Session | JoinedSession | null> {
    return await mysql.session.findUnique({ where: { id: id }, include: { users: include ?? false } })
  }

  public async update(
    id: string,
    data: Prisma.SessionUpdateInput,
    include?: boolean,
  ): Promise<Session | JoinedSession> {
    return await mysql.session.update({ where: { id: id }, data: data, include: { users: include ?? false } })
  }
}
