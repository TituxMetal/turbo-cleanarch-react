import { Injectable } from '@nestjs/common'

import { UserRepositoryPort } from '~/user/application/ports/user.repository'
import { UserEntity } from '~/user/domain/entities/user.entity'

@Injectable()
export class InMemoryUserRepository implements UserRepositoryPort {
  private readonly users: Map<string, UserEntity> = new Map()

  save(user: UserEntity) {
    this.users.set(user.getId().getValue(), user)

    return user
  }

  findById(id: string) {
    return this.users.get(id) || null
  }

  findByEmail(email: string) {
    const users = Array.from(this.users.values())

    return users.find(user => user.getEmail().getValue() === email) || null
  }

  findAll() {
    return Array.from(this.users.values())
  }

  delete(id: string) {
    this.users.delete(id)
  }
}
