import { randomUUID } from 'node:crypto'

export class TaskId {
  private readonly value: string

  constructor(id?: string) {
    this.value = id || randomUUID()
  }

  getValue(): string {
    return this.value
  }

  equals(other: TaskId): boolean {
    return this.value === other.getValue()
  }
}
