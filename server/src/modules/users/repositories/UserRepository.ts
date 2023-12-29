import { AuthProvider, Prisma, Profile, User } from '@db/mysql/generated/mysql'

export type JoinedUser = User & { profile: Profile; authProvider: AuthProvider }

export default interface UserRepository {
  save(data: Prisma.UserCreateInput): Promise<User>
  save(data: Prisma.UserCreateInput, include: true): Promise<JoinedUser>
  save(data: Prisma.UserCreateInput, include?: boolean): Promise<User | JoinedUser>

  findById(id: string): Promise<User | null>
  findById(id: string, include: true): Promise<JoinedUser | null>
  findById(id: string, include?: boolean): Promise<User | JoinedUser | null>

  findByProviderId(providerId: string): Promise<User | null>
  findByProviderId(providerId: string, include: true): Promise<JoinedUser | null>
  findByProviderId(providerId: string, include?: boolean): Promise<User | JoinedUser | null>

  update(googleId: string, data: Prisma.UserUpdateInput): Promise<User>
  update(googleId: string, data: Prisma.UserUpdateInput, include: true): Promise<JoinedUser>
  update(googleId: string, data: Prisma.UserUpdateInput, include?: boolean): Promise<User | JoinedUser>
}
