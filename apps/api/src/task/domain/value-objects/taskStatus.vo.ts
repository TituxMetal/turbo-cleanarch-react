export enum TaskStatusEnum {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export class TaskStatus {
  private readonly value: TaskStatusEnum

  constructor(status: TaskStatusEnum = TaskStatusEnum.TODO) {
    this.value = status
  }

  getValue(): TaskStatusEnum {
    return this.value
  }

  equals(other: TaskStatus): boolean {
    return this.value === other.getValue()
  }

  isTodo(): boolean {
    return this.value === TaskStatusEnum.TODO
  }

  isInProgress(): boolean {
    return this.value === TaskStatusEnum.IN_PROGRESS
  }

  isCompleted(): boolean {
    return this.value === TaskStatusEnum.COMPLETED
  }
}
