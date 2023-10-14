import { mysql } from '@configs/prisma.config'
import { Prisma, User } from '@db/mysql/generated/mysql'

import UserRepository, { JoinedUser } from '../UserRepository'

export default class UserRepositoryImpl implements UserRepository {
  public async save(data: Prisma.UserCreateInput): Promise<User>
  public async save(data: Prisma.UserCreateInput, include: true): Promise<JoinedUser>
  public async save(data: Prisma.UserCreateInput, include?: boolean): Promise<User | JoinedUser> {
    return await mysql.user.create({ data: data, include: { profile: include ?? false } })
  }

  public async findUserByGoogleId(googleId: string): Promise<User | null>
  public async findUserByGoogleId(googleId: string, include: true): Promise<JoinedUser | null>
  public async findUserByGoogleId(googleId: string, include?: boolean): Promise<User | JoinedUser | null> {
    return await mysql.user.findUnique({ where: { google_id: googleId }, include: { profile: include ?? false } })
  }

  public async update(googleId: string, data: Prisma.UserUpdateInput): Promise<User>
  public async update(googleId: string, data: Prisma.UserUpdateInput, include: true): Promise<JoinedUser>
  public async update(googleId: string, data: Prisma.UserUpdateInput, include?: boolean): Promise<User | JoinedUser> {
    return await mysql.user.update({
      where: { google_id: googleId },
      data: data,
      include: { profile: include ?? false },
    })
  }
}
