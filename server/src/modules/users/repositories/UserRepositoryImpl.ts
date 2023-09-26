import { Prisma, User } from '@prisma/mysql/generated/mysql'
import { mysql } from '@configs/prisma.config'
import UserRepository from './UserRepository'

export default class UserRepositoryImpl implements UserRepository {
  public async save(data: Prisma.UserCreateInput): Promise<User> {
    return await mysql.user.create({ data: data })
  }

  public async findUserByGoogleId(googleId: string, profile: boolean = false): Promise<User | null> {
    return await mysql.user.findUnique({ where: { google_id: googleId }, include: { profile: profile } })
  }

  public async update(googleId: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await mysql.user.update({ where: { google_id: googleId }, data: data })
  }
}
