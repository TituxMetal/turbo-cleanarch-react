import { Injectable, Inject } from '@nestjs/common'

import { TASK_REPOSITORY, TaskRepositoryPort } from '~/task/application/ports/task.repository'
import { TaskEntity } from '~/task/domain/entities/task.entity'

@Injectable()
export class ListTasksUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepositoryPort
  ) {}

  async execute(userId?: string): Promise<TaskEntity[]> {
    if (userId) {
      return this.taskRepository.findByUserId(userId)
    }
    return this.taskRepository.findAll()
  }
}
