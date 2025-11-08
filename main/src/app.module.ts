import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { RedisOptions } from './redis/constants/redis-options.constants';
import { RedisModule } from './redis/redis.module';
import { CustomerModule } from './customer/customer.module';
import { NoteModule } from './note/note.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync(RedisOptions),
    RedisModule,
    CustomerModule,
    NoteModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
