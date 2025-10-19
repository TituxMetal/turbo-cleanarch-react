import { Module } from '@nestjs/common'

import { USER_REPOSITORY } from './application/ports/user.repository'
import { CreateUserUseCase } from './application/use-cases/createUser.uc'
import { DeleteUserUseCase } from './application/use-cases/deleteUser.us'
import { GetUserUseCase } from './application/use-cases/getUser.uc'
import { ListUsersUseCase } from './application/use-cases/listUsers.us'
import { UpdateUserUseCase } from './application/use-cases/updateUser.uc'
import { InMemoryUserRepository } from './infrastructure/adapters/inMemoryUser.repository'
import { UserController } from './presentation/user.controller'

@Module({
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    { provide: USER_REPOSITORY, useClass: InMemoryUserRepository }
  ],
  exports: [USER_REPOSITORY]
})
export class UserModule {}
