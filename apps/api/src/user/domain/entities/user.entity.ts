import { Email } from '~/user/domain/value-objects/email.vo'
import { UserId } from '~/user/domain/value-objects/id.vo'

export class UserEntity {
  constructor(
    private readonly id: UserId,
    private email: Email,
    private name: string,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  static create(name: string, email: string): UserEntity {
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long')
    }

    return new UserEntity(new UserId(), new Email(email), name.trim(), new Date(), new Date())
  }

  getId(): UserId {
    return this.id
  }

  getEmail(): Email {
    return this.email
  }

  getName(): string {
    return this.name
  }

  getCreatedAt(): Date {
    return this.createdAt
  }

  getUpdatedAt(): Date {
    return this.updatedAt
  }

  updateName(name: string) {
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long')
    }

    this.name = name.trim()
    this.updatedAt = new Date()
  }

  updateEmail(email: string) {
    this.email = new Email(email)
    this.updatedAt = new Date()
  }

  getAccountAge(): number {
    const now = new Date()
    const diffTime = now.getTime() - this.createdAt.getTime()

    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
}
