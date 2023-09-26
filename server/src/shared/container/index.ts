import { container } from 'tsyringe'
import UserRepository from '../../modules/users/repositories/UserRepository'
import UserRepositoryImpl from '../../modules/users/repositories/UserRepositoryImpl'
import SessionRepository from '../../modules/sessions/repositories/SessionRepository'
import SessionRepositoryImpl from '../../modules/sessions/repositories/SessionRepositoryImpl'

container.registerSingleton<UserRepository>('UserRepository', UserRepositoryImpl)
container.registerSingleton<SessionRepository>('SessionRepository', SessionRepositoryImpl)
