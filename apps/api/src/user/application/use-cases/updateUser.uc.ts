import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import { USER_REPOSITORY, UserRepositoryPort } from '~/user/application/ports/user.repository'

export interface UpdateUserDto {
  name?: string
  email?: string
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(dto: UpdateUserDto, id: string) {
    const user = await this.userRepository.findById(id)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (dto.name !== undefined) {
      user.updateName(dto.name)
    }

    if (dto.email !== undefined) {
      user.updateEmail(dto.email)
    }

    return this.userRepository.save(user)
  }
}
