import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import Redis from 'ioredis';
import { redisHostPort } from '../redis/constants/redis-host-port';

@Injectable()
export class RedisService {
  constructor() {}

  private readonly redisClient = new Redis(redisHostPort);

  private readonly eventEmitter: ClientProxy = ClientProxyFactory.create({
    transport: Transport.REDIS,
    options: redisHostPort,
  });
  async setData(key: string, data: any) {
    await this.redisClient.set(key, JSON.stringify(data));
    
    // Only emit createCustomer event for customer data
    if (key.startsWith('customer:')) {
      this.eventEmitter.emit('createCustomer', { data });
    }

    return { message: `Data stored in Redis under key '${key}'` };
  }

  async getData(key: string): Promise<any> {
    const value = await this.redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  async deleteData(key: string) {
    await this.redisClient.del(key);
    return { message: `Key '${key}' deleted from Redis` };
  }

  async getKeys() {
    return this.redisClient.keys('*');
  }
}
