import { Injectable, Inject, NotFoundException } from '@nestjs/common'

import { TASK_REPOSITORY, TaskRepositoryPort } from '~/task/application/ports/task.repository'
import { TaskEntity } from '~/task/domain/entities/task.entity'
import { USER_REPOSITORY, UserRepositoryPort } from '~/user/application/ports/user.repository'

export interface CreateTaskDto {
  title: string
  description: string
  userId: string
}

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(dto: CreateTaskDto): Promise<TaskEntity> {
    const user = await this.userRepository.findById(dto.userId)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    const task = TaskEntity.create(dto.title, dto.description, dto.userId)
    return this.taskRepository.save(task)
  }
}
