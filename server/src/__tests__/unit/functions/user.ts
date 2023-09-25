import { User } from '../../../../prisma/mysql/generated/mysql'
import { Context } from '../../context'

export const createUser = async (id: string, userData: any, ctx: Context): Promise<User> => {
  try {
    const user = await ctx.prisma.user.create({
      data: { google_id: id, ...userData },
    })
    return user
  } catch (e) {
    console.error('Error creating user:', e)
    throw e
  }
}

export const updateUser = async (userId: string, updateData: any, ctx: Context): Promise<User> => {
  try {
    const updatedUser = await ctx.prisma.user.update({
      where: { id: userId },
      data: updateData,
    })
    return updatedUser
  } catch (e) {
    console.error('Error updating user:', e)
    throw e
  }
}
