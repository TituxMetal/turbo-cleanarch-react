import { randomUUID } from 'crypto'

export class UserId {
  private readonly value: string

  constructor(id?: string) {
    this.value = id || this.generateId()
  }

  getValue(): string {
    return this.value
  }

  equals(other: UserId): boolean {
    return this.value === other.getValue()
  }

  private generateId(): string {
    return randomUUID()
  }
}
