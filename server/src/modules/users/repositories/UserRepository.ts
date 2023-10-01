import { Prisma, User } from '@db/mysql/generated/mysql'

export default interface UserRepository {
  save(data: Prisma.UserCreateInput): Promise<User>

  findUserByGoogleId(googleId: string, profile?: boolean): Promise<User | null>

  update(googleId: string, data: Prisma.UserUpdateInput): Promise<User>
}
