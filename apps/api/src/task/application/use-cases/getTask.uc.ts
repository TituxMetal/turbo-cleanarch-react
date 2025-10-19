import { Injectable, Inject, NotFoundException } from '@nestjs/common'

import { TASK_REPOSITORY, TaskRepositoryPort } from '~/task/application/ports/task.repository'
import { TaskEntity } from '~/task/domain/entities/task.entity'

@Injectable()
export class GetTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepositoryPort
  ) {}

  async execute(id: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findById(id)
    if (!task) {
      throw new NotFoundException('Task not found')
    }
    return task
  }
}
