import { Injectable } from '@nestjs/common'

import { TaskRepositoryPort } from '~/task/application/ports/task.repository'
import { TaskEntity } from '~/task/domain/entities/task.entity'

@Injectable()
export class InMemoryTaskRepository implements TaskRepositoryPort {
  private readonly tasks = new Map<string, TaskEntity>()

  save(task: TaskEntity): TaskEntity {
    this.tasks.set(task.getId().getValue(), task)
    return task
  }

  findById(id: string): TaskEntity | null {
    return this.tasks.get(id) || null
  }

  findByUserId(userId: string): TaskEntity[] {
    return Array.from(this.tasks.values()).filter(task => task.getUserId().getValue() === userId)
  }

  findAll(): TaskEntity[] {
    return Array.from(this.tasks.values())
  }

  delete(id: string): void {
    this.tasks.delete(id)
  }
}
