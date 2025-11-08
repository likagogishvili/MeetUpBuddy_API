import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({
    example: 'Meeting with client',
    description: 'Title of the note/event',
  })
  title: string;

  @ApiProperty({
    example: 'Discuss project requirements',
    description: 'Description of the note',
  })
  description: string;

  @ApiProperty({
    example: '2024-12-25T10:00:00Z',
    description: 'Date and time for the calendar event (ISO string)',
  })
  date: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Customer ID associated with the note',
  })
  customerId: string;
}
