import SessionRepository from '@modules/sessions/repositories/SessionRepository'
import SessionRepositoryImpl from '@modules/sessions/repositories/implementations/SessionRepositoryImpl'
import UserRepository from '@modules/users/repositories/UserRepository'
import UserRepositoryImpl from '@modules/users/repositories/implementations/UserRepositoryImpl'

import 'reflect-metadata'
import { container } from 'tsyringe'

container.registerSingleton<UserRepository>('UserRepository', UserRepositoryImpl)
container.registerSingleton<SessionRepository>('SessionRepository', SessionRepositoryImpl)
