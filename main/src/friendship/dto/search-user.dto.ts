import { ApiProperty } from '@nestjs/swagger';

export class SearchUserDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address to search for',
  })
  email: string;
}

