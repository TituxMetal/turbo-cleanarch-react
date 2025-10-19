import type { TaskEntity } from '~/task/domain/entities/task.entity'

export interface TaskRepositoryPort {
  save(task: TaskEntity): Promise<TaskEntity> | TaskEntity
  findById(id: string): Promise<TaskEntity | null> | TaskEntity | null
  findByUserId(userId: string): Promise<TaskEntity[]> | TaskEntity[]
  findAll(): Promise<TaskEntity[]> | TaskEntity[]
  delete(id: string): Promise<void> | void
}

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY')
