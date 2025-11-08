import { ApiProperty } from '@nestjs/swagger';

export class CheckAvailabilityDto {
  @ApiProperty({
    example: 'friend@example.com',
    description: 'Email of the friend to check availability for',
  })
  email: string;

  @ApiProperty({
    example: '2024-12-25T10:00:00Z',
    description: 'Date and time to check availability (ISO string)',
  })
  date: string;
}

