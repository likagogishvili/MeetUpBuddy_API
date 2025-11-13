import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FriendshipService } from './friendship.service';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';
import { RespondFriendRequestDto } from './dto/respond-friend-request.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { SearchUserDto } from './dto/search-user.dto';

@ApiTags('friendship')
@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post('request/:userId')
  @ApiOperation({ summary: 'Send a friend request' })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user sending the request',
  })
  @ApiResponse({
    status: 201,
    description: 'Friend request sent successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Friend not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Friend request already sent or already friends',
  })
  sendFriendRequest(
    @Param('userId') userId: string,
    @Body() dto: SendFriendRequestDto,
  ) {
    return this.friendshipService.sendFriendRequest(userId, dto);
  }

  @Post('respond/:userId')
  @ApiOperation({ summary: 'Accept or reject a friend request' })
  @ApiParam({ name: 'userId', description: 'ID of the user responding' })
  @ApiResponse({
    status: 200,
    description: 'Friend request responded to successfully',
  })
  respondToFriendRequest(
    @Param('userId') userId: string,
    @Body() dto: RespondFriendRequestDto,
  ) {
    return this.friendshipService.respondToFriendRequest(userId, dto);
  }

  @Get('friends/:userId')
  @ApiOperation({ summary: 'Get all friends of a user' })
  @ApiParam({ name: 'userId', description: 'ID of the user' })
  @ApiResponse({
    status: 200,
    description: 'Friends retrieved successfully',
  })
  getFriends(@Param('userId') userId: string) {
    return this.friendshipService.getFriends(userId);
  }

  @Get('requests/:userId/:type')
  @ApiOperation({ summary: 'Get friend requests (sent or received)' })
  @ApiParam({ name: 'userId', description: 'ID of the user' })
  @ApiParam({
    name: 'type',
    description: 'Type of requests: sent or received',
    enum: ['sent', 'received'],
  })
  @ApiResponse({
    status: 200,
    description: 'Friend requests retrieved successfully',
  })
  getFriendRequests(
    @Param('userId') userId: string,
    @Param('type') type: 'sent' | 'received',
  ) {
    return this.friendshipService.getFriendRequests(userId, type);
  }

  @Post('check-availability/:userId')
  @ApiOperation({
    summary: 'Check if a friend is available on a specific date',
  })
  @ApiParam({ name: 'userId', description: 'ID of the user checking' })
  @ApiResponse({
    status: 200,
    description: 'Availability checked successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Users are not friends',
  })
  checkAvailability(
    @Param('userId') userId: string,
    @Body() dto: CheckAvailabilityDto,
  ) {
    return this.friendshipService.checkAvailability(userId, dto);
  }

  @Post('request-event/:userId')
  @ApiOperation({
    summary: 'Request a calendar event with a friend (checks availability)',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user sending the request',
  })
  @ApiResponse({
    status: 200,
    description: 'Calendar event request sent',
  })
  requestCalendarEvent(
    @Param('userId') userId: string,
    @Body()
    body: {
      email: string;
      title: string;
      description: string;
      date: string;
    },
  ) {
    return this.friendshipService.requestCalendarEvent(userId, body.email, {
      title: body.title,
      description: body.description,
      date: body.date,
    });
  }

  @Get('event-requests/:userId/:type')
  @ApiOperation({
    summary: 'Get event requests (sent or received)',
  })
  @ApiParam({ name: 'userId', description: 'ID of the user' })
  @ApiParam({
    name: 'type',
    description: 'Type of requests: sent or received',
    enum: ['sent', 'received'],
  })
  @ApiResponse({
    status: 200,
    description: 'Event requests retrieved successfully',
  })
  getEventRequests(
    @Param('userId') userId: string,
    @Param('type') type: 'sent' | 'received',
  ) {
    return this.friendshipService.getEventRequests(userId, type);
  }

  @Post('respond-event/:userId')
  @ApiOperation({
    summary: 'Accept or decline an event request',
  })
  @ApiParam({ name: 'userId', description: 'ID of the user responding' })
  @ApiResponse({
    status: 200,
    description: 'Event request responded to successfully',
  })
  respondToEventRequest(
    @Param('userId') userId: string,
    @Body()
    body: {
      requestId: string;
      accept: boolean;
    },
  ) {
    return this.friendshipService.respondToEventRequest(
      userId,
      body.requestId,
      body.accept,
    );
  }

  @Post('search/:userId')
  @ApiOperation({ summary: 'Search for a user by email' })
  @ApiParam({ name: 'userId', description: 'ID of the user searching' })
  @ApiResponse({
    status: 200,
    description: 'User found',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  searchUserByEmail(
    @Param('userId') userId: string,
    @Body() dto: SearchUserDto,
  ) {
    return this.friendshipService.searchUserByEmail(userId, dto.email);
  }
}
