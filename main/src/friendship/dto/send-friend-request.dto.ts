import { ApiProperty } from '@nestjs/swagger';

export class SendFriendRequestDto {
  @ApiProperty({
    example: 'friend@example.com',
    description: 'Email of the user to send friend request to',
  })
  email: string;
}
