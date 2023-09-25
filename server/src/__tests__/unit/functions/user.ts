import { User } from '../../../../prisma/mysql/generated/mysql'
import { Context } from '../../context'

export const createUser = async (userData: User, ctx: Context): Promise<User> => {
  try {
    const user = await ctx.prisma.user.create({
      data: userData,
    })
    return user
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}
