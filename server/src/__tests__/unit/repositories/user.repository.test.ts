import { Prisma, Role } from '@db/mysql/generated/mysql'
import UserRepository, { JoinedUser } from '@modules/users/repositories/UserRepository'
import UserRepositoryImpl from '@modules/users/repositories/implementations/UserRepositoryImpl'

import { mockMySQL } from '../../setup'

describe('User Repository Unit Tests', () => {
  let userRepository: UserRepository

  const joinedUser: JoinedUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Seiwon Park',
    profileThumbnail: 'https://avatars.githubusercontent.com/u/63793178?v=4',
    sessionId: null,
    createdAt: new Date(),
    modifiedAt: new Date(),
    role: Role.USER,
    profile: {
      id: '123e4567-e89b-12d3-a456-436614174000',
      familyName: 'Park',
      givenName: 'Seiwon',
      profileImage: 'https://avatars.githubusercontent.com/u/63793178?v=4',
      email: 'psw7347@gmail.com',
      userId: '123e4567-e89b-12d3-a456-426614174000',
    },
    authProvider: {
      id: '123e4567-e89b-12d3-a456-446614174000',
      provider: 'google',
      providerId: '000000000000000000000',
      userId: '123e4567-e89b-12d3-a456-426614174000',
    },
  }

  beforeEach(() => {
    userRepository = new UserRepositoryImpl()
  })

  test('should save a new user with provider', async () => {
    expect.assertions(2)

    mockMySQL.user.create.mockResolvedValue(joinedUser)

    const createUserData: Prisma.UserCreateInput = {
      name: 'Seiwon Park',
      profileThumbnail: 'https://avatars.githubusercontent.com/u/63793178?v=4',
      profile: {
        create: {
          familyName: 'Park',
          givenName: 'Seiwon',
          profileImage: 'https://avatars.githubusercontent.com/u/63793178?v=4',
        },
      },
      authProvider: {
        create: {
          provider: 'google',
          providerId: '000000000000000000000',
        },
      },
    }

    const result = await userRepository.save(createUserData)
    expect(result).toEqual(joinedUser)
    expect(mockMySQL.user.create).toHaveBeenCalledWith({
      data: createUserData,
      include: { profile: false, authProvider: true },
    })
  })

  test('should find an existing user by Google ID', async () => {
    expect.assertions(2)

    mockMySQL.user.findFirst.mockResolvedValue(joinedUser)
    const googleId = '000000000000000000000'

    const result = await userRepository.findByProviderId(googleId, false)
    expect(result).toEqual(joinedUser)
    expect(mockMySQL.user.findFirst).toHaveBeenCalledWith({
      where: { authProvider: { some: { providerId: googleId } } },
      include: { profile: false, authProvider: true },
    })
  })

  test('should update an existing user', async () => {
    expect.assertions(2)

    mockMySQL.user.update.mockResolvedValue({ ...joinedUser, name: 'Updated name' })

    const id = '123e4567-e89b-12d3-a456-426614174000'
    const updateUserInput: Prisma.UserUpdateInput = {
      name: 'Updated name',
    }

    const result = await userRepository.update(id, updateUserInput)
    expect(result.name).toEqual('Updated name')
    expect(mockMySQL.user.update).toHaveBeenCalledWith({
      where: { id: id },
      data: updateUserInput,
      include: { profile: false, authProvider: true },
    })
  })
})
