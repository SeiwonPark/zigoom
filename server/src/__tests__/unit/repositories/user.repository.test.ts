import { Prisma, Role, User } from '@db/mysql/generated/mysql'
import UserRepository from '@modules/users/repositories/UserRepository'
import UserRepositoryImpl from '@modules/users/repositories/implementations/UserRepositoryImpl'

import { mockMySQL } from '../../setup'

describe('User Repository Unit Tests', () => {
  let userRepository: UserRepository

  const user: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    google_id: '000000000000000000000',
    name: 'Seiwon Park',
    profileThumbnail: 'https://avatars.githubusercontent.com/u/63793178?v=4',
    sessionId: null,
    createdAt: new Date(),
    modifiedAt: new Date(),
    role: Role.USER,
  }

  beforeEach(() => {
    userRepository = new UserRepositoryImpl()
  })

  test('should save a new user', async () => {
    expect.assertions(2)

    mockMySQL.user.create.mockResolvedValue(user)

    const createUserData: Prisma.UserCreateInput = {
      google_id: '000000000000000000000',
      name: 'Seiwon Park',
      profileThumbnail: 'https://avatars.githubusercontent.com/u/63793178?v=4',
      profile: {
        create: {
          family_name: 'Park',
          given_name: 'Seiwon',
          profileImage: 'https://avatars.githubusercontent.com/u/63793178?v=4',
        },
      },
    }

    const result = await userRepository.save(createUserData)
    expect(result).toEqual(user)
    expect(mockMySQL.user.create).toHaveBeenCalledWith({ data: createUserData, include: { profile: false } })
  })

  test('should find an existing user by Google ID', async () => {
    expect.assertions(2)

    mockMySQL.user.findUnique.mockResolvedValue(user)
    const googleId = '000000000000000000000'

    const result = await userRepository.findUserByGoogleId(googleId, false)
    expect(result).toEqual(user)
    expect(mockMySQL.user.findUnique).toHaveBeenCalledWith({
      where: { google_id: googleId },
      include: { profile: false },
    })
  })

  test('should update an existing user', async () => {
    mockMySQL.user.update.mockResolvedValue(user)

    const googleId = '000000000000000000000'
    const updateUserInput: Prisma.UserUpdateInput = {
      name: 'Updated name',
    }

    const result = await userRepository.update(googleId, updateUserInput)
    expect(result).toEqual(user)
    expect(mockMySQL.user.update).toHaveBeenCalledWith({
      where: { google_id: googleId },
      data: updateUserInput,
      include: { profile: false },
    })
  })
})
