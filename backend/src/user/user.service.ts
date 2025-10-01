import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '../utils/password';
import { PublicUser } from './dto/public-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<PublicUser> {
    const existing = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const { password, roles, isActive = true, ...rest } = createUserDto;
    const user = this.userRepository.create({
      ...rest,
      isActive,
      roles: roles && roles.length > 0 ? roles : ['user'],
      passwordHash: await hashPassword(password),
    });

    const saved = await this.userRepository.save(user);
    return this.toPublic(saved);
  }

  async findAll(): Promise<PublicUser[]> {
    const users = await this.userRepository.find();
    return users.map(user => this.toPublic(user));
  }

  async findOne(id: number): Promise<PublicUser> {
    const user = await this.findEntityById(id);
    return this.toPublic(user);
  }

  async getById(id: number): Promise<PublicUser> {
    return this.findOne(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<PublicUser> {
    const user = await this.findEntityById(id);

    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }
    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }
    if (typeof updateUserDto.isActive === 'boolean') {
      user.isActive = updateUserDto.isActive;
    }
    if (updateUserDto.roles) {
      user.roles = updateUserDto.roles;
    }
    if (updateUserDto.password) {
      user.passwordHash = await hashPassword(updateUserDto.password);
    }

    const saved = await this.userRepository.save(user);
    return this.toPublic(saved);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  toPublic(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles ?? ['user'],
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async findEntityById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}

