import { ApiProperty } from '@nestjs/swagger';

export class RespondFriendRequestDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the friend request',
  })
  requestId: string;

  @ApiProperty({
    example: true,
    description: 'Whether to accept (true) or reject (false) the request',
  })
  accept: boolean;
}

