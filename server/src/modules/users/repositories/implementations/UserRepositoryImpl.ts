import { mysql } from '@configs/prisma.config'
import { Prisma, User } from '@db/mysql/generated/mysql'

import UserRepository, { JoinedUser } from '../UserRepository'

export default class UserRepositoryImpl implements UserRepository {
  public async save(data: Prisma.UserCreateInput): Promise<JoinedUser>
  public async save(data: Prisma.UserCreateInput, include: true): Promise<JoinedUser>
  public async save(data: Prisma.UserCreateInput, include?: boolean): Promise<User | JoinedUser> {
    return await mysql.user.create({ data: data, include: { profile: include ?? false, authProvider: true } })
  }

  public async findById(id: string): Promise<User | null>
  public async findById(id: string, include: true): Promise<JoinedUser | null>
  public async findById(id: string, include?: boolean): Promise<User | JoinedUser | null> {
    return await mysql.user.findUnique({
      where: { id: id },
      include: { profile: include ?? false, authProvider: true },
    })
  }

  public async findByProviderId(providerId: string): Promise<User | null>
  public async findByProviderId(providerId: string, include: true): Promise<JoinedUser | null>
  public async findByProviderId(providerId: string, include?: boolean): Promise<User | JoinedUser | null> {
    return await mysql.user.findFirst({
      where: { authProvider: { some: { providerId: providerId } } },
      include: { profile: include ?? false, authProvider: true },
    })
  }

  public async update(id: string, data: Prisma.UserUpdateInput): Promise<User>
  public async update(id: string, data: Prisma.UserUpdateInput, include: true): Promise<JoinedUser>
  public async update(id: string, data: Prisma.UserUpdateInput, include?: boolean): Promise<User | JoinedUser> {
    return await mysql.user.update({
      where: { id: id },
      data: data,
      include: { profile: include ?? false, authProvider: true },
    })
  }
}
