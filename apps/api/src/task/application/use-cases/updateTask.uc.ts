import { Injectable, Inject, NotFoundException } from '@nestjs/common'

import { TASK_REPOSITORY, TaskRepositoryPort } from '~/task/application/ports/task.repository'
import { TaskEntity } from '~/task/domain/entities/task.entity'
import { TaskStatusEnum } from '~/task/domain/value-objects/taskStatus.vo'

export interface UpdateTaskDto {
  title?: string
  description?: string
  status?: TaskStatusEnum
}

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepositoryPort
  ) {}

  async execute(id: string, dto: UpdateTaskDto): Promise<TaskEntity> {
    const task = await this.taskRepository.findById(id)

    if (!task) {
      throw new NotFoundException('Task not found')
    }

    if (dto.title !== undefined) {
      task.updateTitle(dto.title)
    }

    if (dto.description !== undefined) {
      task.updateDescription(dto.description)
    }

    if (dto.status !== undefined) {
      switch (dto.status) {
        case TaskStatusEnum.COMPLETED:
          task.markAsCompleted()
          break
        case TaskStatusEnum.IN_PROGRESS:
          task.markAsInProgress()
          break
        case TaskStatusEnum.TODO:
          task.markAsTodo()
          break
      }
    }

    return this.taskRepository.save(task)
  }
}
