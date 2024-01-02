import { container } from 'tsyringe'

import SessionRepository from '@modules/sessions/repositories/SessionRepository'
import SessionRepositoryImpl from '@modules/sessions/repositories/implementations/SessionRepositoryImpl'
import { AuthProvider } from '@modules/users/adapters'
import GoogleAuth from '@modules/users/adapters/GoogleAuth/GoogleAuth'
import GoogleAuthProvider from '@modules/users/adapters/GoogleAuth/GoogleAuthProvider'
import UserRepository from '@modules/users/repositories/UserRepository'
import UserRepositoryImpl from '@modules/users/repositories/implementations/UserRepositoryImpl'
import SingleUploadService from '@modules/users/services/SingleUploadService'

container.registerSingleton<GoogleAuth>('GoogleAuth', GoogleAuth)
container.registerSingleton<AuthProvider>('GoogleAuthProvider', GoogleAuthProvider)
container.registerSingleton<UserRepository>('UserRepository', UserRepositoryImpl)
container.registerSingleton<SessionRepository>('SessionRepository', SessionRepositoryImpl)
container.registerSingleton<SingleUploadService>('SingleUploadService', SingleUploadService)
