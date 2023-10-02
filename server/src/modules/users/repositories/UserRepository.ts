import { Prisma, Profile, User } from '@db/mysql/generated/mysql'

export type JoinedUser = User & { profile: Profile }

export default interface UserRepository {
  save(data: Prisma.UserCreateInput, include?: boolean): Promise<User | JoinedUser>

  findUserByGoogleId(googleId: string, include?: boolean): Promise<User | JoinedUser | null>

  update(googleId: string, data: Prisma.UserUpdateInput, include?: boolean): Promise<User | JoinedUser>
}
