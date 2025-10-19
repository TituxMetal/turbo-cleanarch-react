import { Injectable, Inject, NotFoundException } from '@nestjs/common'

import { TASK_REPOSITORY, TaskRepositoryPort } from '~/task/application/ports/task.repository'

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepositoryPort
  ) {}

  async execute(id: string): Promise<void> {
    const task = await this.taskRepository.findById(id)
    if (!task) {
      throw new NotFoundException('Task not found')
    }
    await this.taskRepository.delete(id)
  }
}
