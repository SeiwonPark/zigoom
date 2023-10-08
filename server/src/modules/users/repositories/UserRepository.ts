import { Prisma, Profile, User } from '@db/mysql/generated/mysql'

export type JoinedUser = User & { profile: Profile }

export default interface UserRepository {
  save(data: Prisma.UserCreateInput): Promise<User>
  save(data: Prisma.UserCreateInput, include: true): Promise<JoinedUser>
  save(data: Prisma.UserCreateInput, include?: boolean): Promise<User | JoinedUser>

  findUserByGoogleId(googleId: string): Promise<User | null>
  findUserByGoogleId(googleId: string, include: true): Promise<JoinedUser | null>
  findUserByGoogleId(googleId: string, include?: boolean): Promise<User | JoinedUser | null>

  update(googleId: string, data: Prisma.UserUpdateInput): Promise<User>
  update(googleId: string, data: Prisma.UserUpdateInput, include: true): Promise<JoinedUser>
  update(googleId: string, data: Prisma.UserUpdateInput, include?: boolean): Promise<User | JoinedUser>
}
