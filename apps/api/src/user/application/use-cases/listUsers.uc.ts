import { Inject, Injectable } from '@nestjs/common'

import { USER_REPOSITORY, UserRepositoryPort } from '~/user/application/ports/user.repository'
import { UserEntity } from '~/user/domain/entities/user.entity'

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(): Promise<Array<UserEntity>> {
    return this.userRepository.findAll()
  }
}
