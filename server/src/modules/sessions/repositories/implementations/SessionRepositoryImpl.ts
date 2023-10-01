import { Prisma, Session } from '@db/mysql/generated/mysql'
import { mysql } from '@configs/prisma.config'
import SessionRepository from '../SessionRepository'

export default class SessionRepositoryImpl implements SessionRepository {
  public async save(data: Prisma.SessionCreateInput): Promise<Session> {
    return await mysql.session.create({ data: data, include: { users: true } })
  }

  public async findById(id: string): Promise<Session | null> {
    return await mysql.session.findUnique({ where: { id: id } })
  }
}
