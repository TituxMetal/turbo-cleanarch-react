import type { UserEntity } from '~/user/domain/entities/user.entity'

export interface UserRepositoryPort {
  save(user: UserEntity): Promise<UserEntity> | UserEntity
  findById(id: string): Promise<UserEntity | null> | UserEntity | null
  findByEmail(email: string): Promise<UserEntity | null> | UserEntity | null
  findAll(): Promise<UserEntity[]> | UserEntity[]
  delete(id: string): Promise<void> | void
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY')
