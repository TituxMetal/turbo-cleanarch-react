import { TaskId } from '~/task/domain/value-objects/taskId.vo'
import { TaskStatus, TaskStatusEnum } from '~/task/domain/value-objects/taskStatus.vo'
import { UserId } from '~/user/domain/value-objects/id.vo'

export class TaskEntity {
  constructor(
    private readonly id: TaskId,
    private title: string,
    private description: string,
    private status: TaskStatus,
    private readonly userId: UserId,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private completedAt: Date | null
  ) {}

  static create(title: string, description: string, userId: string): TaskEntity {
    if (!title || title.trim().length === 0) {
      throw new Error('Task title cannot be empty')
    }
    if (title.trim().length > 200) {
      throw new Error('Task title cannot exceed 200 characters')
    }
    if (description.trim().length > 2000) {
      throw new Error('Task description cannot exceed 2000 characters')
    }

    return new TaskEntity(
      new TaskId(),
      title.trim(),
      description.trim(),
      new TaskStatus(TaskStatusEnum.TODO),
      new UserId(userId),
      new Date(),
      new Date(),
      null
    )
  }

  getId(): TaskId {
    return this.id
  }

  getTitle(): string {
    return this.title
  }

  getDescription(): string {
    return this.description
  }

  getStatus(): TaskStatus {
    return this.status
  }

  getUserId(): UserId {
    return this.userId
  }

  getCreatedAt(): Date {
    return this.createdAt
  }

  getUpdatedAt(): Date {
    return this.updatedAt
  }

  getCompletedAt(): Date | null {
    return this.completedAt
  }

  updateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Task title cannot be empty')
    }
    if (title.trim().length > 200) {
      throw new Error('Task title cannot exceed 200 characters')
    }
    this.title = title.trim()
    this.updatedAt = new Date()
  }

  updateDescription(description: string): void {
    if (description.trim().length > 2000) {
      throw new Error('Task description cannot exceed 2000 characters')
    }
    this.description = description.trim()
    this.updatedAt = new Date()
  }

  markAsCompleted(): void {
    this.status = new TaskStatus(TaskStatusEnum.COMPLETED)
    this.completedAt = new Date()
    this.updatedAt = new Date()
  }

  markAsInProgress(): void {
    this.status = new TaskStatus(TaskStatusEnum.IN_PROGRESS)
    this.updatedAt = new Date()
  }

  markAsTodo(): void {
    this.status = new TaskStatus(TaskStatusEnum.TODO)
    this.completedAt = null
    this.updatedAt = new Date()
  }

  isOwnedBy(userId: UserId): boolean {
    return this.userId.equals(userId)
  }
}
