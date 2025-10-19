import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common'

import { CreateUserDto, CreateUserUseCase } from '~/user/application/use-cases/createUser.uc'
import { GetUserUseCase } from '~/user/application/use-cases/getUser.uc'
import { ListUsersUseCase } from '~/user/application/use-cases/listUsers.uc'
import { UpdateUserDto, UpdateUserUseCase } from '~/user/application/use-cases/updateUser.uc'
import { UserEntity } from '~/user/domain/entities/user.entity'

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase
  ) {}

  @Post()
  async createUser(@Body() request: CreateUserDto) {
    const user = await this.createUserUseCase.execute(request)

    if (!user) {
      throw new Error('Unexpected null user returned from create operation')
    }

    return this.mapToResponse(user)
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.getUserUseCase.execute(id)

    return this.mapToResponse(user)
  }

  @Get()
  async listUsers() {
    const users = await this.listUsersUseCase.execute()

    return users.map(user => this.mapToResponse(user))
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() request: UpdateUserDto) {
    const user = await this.updateUserUseCase.execute(request, id)

    return this.mapToResponse(user)
  }

  private mapToResponse(user: UserEntity) {
    return {
      id: user.getId().getValue(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
      accountAge: user.getAccountAge()
    }
  }
}
