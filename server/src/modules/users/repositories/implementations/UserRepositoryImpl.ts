import { Prisma, User } from '@db/mysql/generated/mysql'
import { mysql } from '@configs/prisma.config'
import UserRepository, { JoinedUser } from '../UserRepository'

export default class UserRepositoryImpl implements UserRepository {
  public async save(data: Prisma.UserCreateInput, include?: boolean): Promise<User | JoinedUser> {
    return await mysql.user.create({ data: data, include: { profile: include ?? false } })
  }

  public async findUserByGoogleId(googleId: string, include?: boolean): Promise<User | JoinedUser | null> {
    return await mysql.user.findUnique({ where: { google_id: googleId }, include: { profile: include ?? false } })
  }

  public async update(googleId: string, data: Prisma.UserUpdateInput, include?: boolean): Promise<User | JoinedUser> {
    return await mysql.user.update({
      where: { google_id: googleId },
      data: data,
      include: { profile: include ?? false },
    })
  }
}
