import { ConflictException, Inject, Injectable } from '@nestjs/common'

import { USER_REPOSITORY, UserRepositoryPort } from '~/user/application/ports/user.repository'
import { UserEntity } from '~/user/domain/entities/user.entity'

export interface CreateUserDto {
  name: string
  email: string
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(dto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findByEmail(dto.email)

    if (existingUser) {
      throw new ConflictException('User with this email already exists')
    }

    const user = UserEntity.create(dto.name, dto.email)
    const savedUser = await this.userRepository.save(user)

    return savedUser
  }
}
