import { Injectable, ConflictException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from 'src/redis/redis.service';
import { NoteService } from 'src/note/note.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerService {
  constructor(
    private readonly redisService: RedisService,
    private readonly noteService: NoteService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto) {
    // Check if email already exists
    const existingCustomer = await this.findByEmail(createCustomerDto.email);
    if (existingCustomer) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createCustomerDto.password, 10);

    const id = uuidv4();
    const key = `customer:${id}`;
    const data = {
      ...createCustomerDto,
      password: hashedPassword,
      id,
    };
    await this.redisService.setData(key, data);
    return {
      message: 'Customer created and stored in Redis',
      id,
    };
  }

  async findByEmail(email: string) {
    const keys = await this.redisService.getKeys();
    const customerKeys = keys.filter((key) => key.startsWith('customer:'));

    for (const key of customerKeys) {
      const customer = await this.redisService.getData(key);
      if (customer && customer.email === email) {
        return customer;
      }
    }
    return null;
  }

  async findOne(id: string) {
    const key = `customer:${id}`;
    const customer = await this.redisService.getData(key);
    return customer || { message: `Customer ${id} not found` };
  }

  async findOneWithNotes(id: string) {
    const key = `customer:${id}`;
    const customer = await this.redisService.getData(key);
    if (!customer) {
      return { message: `Customer ${id} not found` };
    }

    const notes = await this.noteService.findByCustomerId(id);
    return {
      ...customer,
      notes,
    };
  }

  async findAll() {
    const keys = await this.redisService.getKeys();
    const customerKeys = keys.filter((key) => key.startsWith('customer:'));
    const customers = await Promise.all(
      customerKeys.map((key) => this.redisService.getData(key)),
    );
    return customers;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const key = `customer:${id}`;
    const existing = await this.redisService.getData(key);
    if (!existing) return { message: `Customer ${id} not found` };

    const updated = { ...existing, ...updateCustomerDto };
    await this.redisService.setData(key, updated);
    return { message: `Customer ${id} updated`, customer: updated };
  }

  async remove(id: string) {
    const key = `customer:${id}`;
    const existing = await this.redisService.getData(key);
    if (!existing) return { message: `Customer ${id} not found` };

    await this.redisService.deleteData(key);
    return { message: `Customer ${id} deleted`, deleted: existing };
  }
}
