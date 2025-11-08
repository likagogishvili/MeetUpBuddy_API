import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { CustomerService } from 'src/customer/customer.service';
import { NoteService } from 'src/note/note.service';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';
import { RespondFriendRequestDto } from './dto/respond-friend-request.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FriendshipService {
  constructor(
    private readonly redisService: RedisService,
    private readonly customerService: CustomerService,
    private readonly noteService: NoteService,
  ) {}

  async sendFriendRequest(userId: string, dto: SendFriendRequestDto) {
    // Find friend by email
    const friend = await this.customerService.findByEmail(dto.email);
    if (!friend) {
      throw new NotFoundException('Friend not found');
    }

    const friendId = friend.id;

    // Can't send request to yourself
    if (userId === friendId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    // Check if already friends
    const existingFriendship = await this.getFriendship(userId, friendId);
    if (existingFriendship?.status === 'accepted') {
      throw new ConflictException('Already friends');
    }

    // Check if request already exists from this user
    const existingRequest = await this.getFriendRequest(userId, friendId);
    if (existingRequest) {
      throw new ConflictException('Friend request already sent');
    }

    // Check if there's a pending request from the friend to this user
    const reverseRequest = await this.getFriendRequest(friendId, userId);
    if (reverseRequest) {
      // Check if both requests exist simultaneously (very rare edge case)
      // If so, auto-accept. Otherwise, tell user to accept existing request.
      const checkIfBothExist = await this.getFriendRequest(userId, friendId);

      if (checkIfBothExist) {
        // Both requests exist - auto-accept mutual request
        const friendshipId = uuidv4();
        const friendshipKey1 = `friendship:${userId}:${friendId}`;
        const friendshipKey2 = `friendship:${friendId}:${userId}`;

        const friendship = {
          id: friendshipId,
          userId1: userId,
          userId2: friendId,
          status: 'accepted',
          createdAt: new Date().toISOString(),
        };

        await this.redisService.setData(friendshipKey1, friendship);
        await this.redisService.setData(friendshipKey2, friendship);

        // Update both request statuses
        reverseRequest.status = 'accepted';
        await this.redisService.setData(
          `friendRequest:${reverseRequest.id}`,
          reverseRequest,
        );
        checkIfBothExist.status = 'accepted';
        await this.redisService.setData(
          `friendRequest:${checkIfBothExist.id}`,
          checkIfBothExist,
        );

        return {
          message: 'Mutual friend request detected! You are now friends.',
          friendship,
          autoAccepted: true,
        };
      } else {
        // Friend already sent you a request - tell user to accept it instead
        throw new ConflictException(
          'You already have a pending friend request from this user. Please accept or decline it first.',
        );
      }
    }

    // Create friend request
    const requestId = uuidv4();
    const requestKey = `friendRequest:${requestId}`;
    const request = {
      id: requestId,
      fromUserId: userId,
      toUserId: friendId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await this.redisService.setData(requestKey, request);

    // Store request IDs for both users
    await this.addToUserRequests(userId, requestId, 'sent');
    await this.addToUserRequests(friendId, requestId, 'received');

    return {
      message: 'Friend request sent',
      request,
    };
  }

  async respondToFriendRequest(userId: string, dto: RespondFriendRequestDto) {
    const requestKey = `friendRequest:${dto.requestId}`;
    const request = await this.redisService.getData(requestKey);

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    if (request.toUserId !== userId) {
      throw new BadRequestException(
        'Not authorized to respond to this request',
      );
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Request already processed');
    }

    if (dto.accept) {
      // Create friendship
      const friendshipId = uuidv4();
      const friendshipKey1 = `friendship:${userId}:${request.fromUserId}`;
      const friendshipKey2 = `friendship:${request.fromUserId}:${userId}`;

      const friendship = {
        id: friendshipId,
        userId1: userId,
        userId2: request.fromUserId,
        status: 'accepted',
        createdAt: new Date().toISOString(),
      };

      await this.redisService.setData(friendshipKey1, friendship);
      await this.redisService.setData(friendshipKey2, friendship);

      // Update request status
      request.status = 'accepted';
      await this.redisService.setData(requestKey, request);

      return {
        message: 'Friend request accepted',
        friendship,
      };
    } else {
      // Reject request
      request.status = 'rejected';
      await this.redisService.setData(requestKey, request);

      return {
        message: 'Friend request rejected',
      };
    }
  }

  async getFriends(userId: string) {
    const keys = await this.redisService.getKeys();
    const friendshipKeys = keys.filter(
      (key) =>
        key.startsWith(`friendship:${userId}:`) &&
        !key.includes('friendRequest:'),
    );

    const friendships = await Promise.all(
      friendshipKeys.map((key) => this.redisService.getData(key)),
    );

    const acceptedFriendships = friendships.filter(
      (f) => f && f.status === 'accepted',
    );

    const friendIds = acceptedFriendships.map((f) =>
      f.userId1 === userId ? f.userId2 : f.userId1,
    );

    const friends = await Promise.all(
      friendIds.map((id) => this.customerService.findOne(id)),
    );

    return {
      message: 'Friends retrieved',
      friends: friends.filter((f) => !f.message),
    };
  }

  async getFriendRequests(
    userId: string,
    type: 'sent' | 'received' = 'received',
  ) {
    const keys = await this.redisService.getKeys();
    const userRequestKeys = keys.filter((key) =>
      key.startsWith(`userRequests:${userId}:${type}:`),
    );

    const requestIds = await Promise.all(
      userRequestKeys.map(async (key) => {
        const data = await this.redisService.getData(key);
        return data?.requestId;
      }),
    );

    const requests = await Promise.all(
      requestIds
        .filter((id) => id)
        .map((id) => this.redisService.getData(`friendRequest:${id}`)),
    );

    const filteredRequests = requests.filter(
      (r) => r && r.status === 'pending',
    );

    // Get user details
    const requestsWithUsers = await Promise.all(
      filteredRequests.map(async (request) => {
        const user =
          type === 'received'
            ? await this.customerService.findOne(request.fromUserId)
            : await this.customerService.findOne(request.toUserId);

        return {
          ...request,
          user: user.message ? null : user,
        };
      }),
    );

    return {
      message: `${type} friend requests`,
      requests: requestsWithUsers,
    };
  }

  async checkAvailability(userId: string, dto: CheckAvailabilityDto) {
    // Find friend by email
    const friend = await this.customerService.findByEmail(dto.email);
    if (!friend) {
      throw new NotFoundException('Friend not found');
    }

    const friendId = friend.id;

    // Check if they are friends
    const friendship = await this.getFriendship(userId, friendId);
    if (!friendship || friendship.status !== 'accepted') {
      throw new BadRequestException('Users are not friends');
    }

    // Get friend's events
    const events = await this.noteService.findByCustomerId(friendId);

    // Check if friend has any events on the requested date
    const requestedDate = new Date(dto.date);
    const requestedDateStr = requestedDate.toISOString().split('T')[0]; // Get date part only

    const conflictingEvents = events.filter((event) => {
      if (!event || !event.date) return false;
      const eventDate = new Date(event.date);
      const eventDateStr = eventDate.toISOString().split('T')[0];
      return eventDateStr === requestedDateStr;
    });

    const isAvailable = conflictingEvents.length === 0;

    return {
      message: isAvailable
        ? 'Friend is available on this date'
        : 'Friend has events on this date',
      friendId: friendId,
      email: dto.email,
      date: dto.date,
      isAvailable,
      conflictingEvents: conflictingEvents.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
      })),
    };
  }

  async requestCalendarEvent(
    userId: string,
    friendEmail: string,
    eventData: { title: string; description: string; date: string },
  ) {
    // Find friend by email
    const friend = await this.customerService.findByEmail(friendEmail);
    if (!friend) {
      throw new NotFoundException('Friend not found');
    }

    const friendId = friend.id;

    // Check if they are friends
    const friendship = await this.getFriendship(userId, friendId);
    if (!friendship || friendship.status !== 'accepted') {
      throw new BadRequestException('Users are not friends');
    }

    // Check availability first
    const availability = await this.checkAvailability(userId, {
      email: friendEmail,
      date: eventData.date,
    });

    if (!availability.isAvailable) {
      return {
        message: 'Friend is not available on this date',
        availability,
        suggestion: 'Please choose a different date',
      };
    }

    // Create calendar event request
    const requestId = uuidv4();
    const requestKey = `calendarRequest:${requestId}`;
    const request = {
      id: requestId,
      fromUserId: userId,
      toUserId: friendId,
      eventData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await this.redisService.setData(requestKey, request);

    return {
      message: 'Calendar event request sent to friend',
      request,
      availability,
    };
  }

  async searchUserByEmail(userId: string, email: string) {
    // Find user by email
    const user = await this.customerService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Don't return yourself
    if (user.id === userId) {
      throw new BadRequestException('Cannot search for yourself');
    }

    const friendId = user.id;

    // Check friendship status
    const friendship = await this.getFriendship(userId, friendId);
    const isFriend = friendship?.status === 'accepted';

    // If already friends, don't allow searching (they're already in friends list)
    if (isFriend) {
      throw new ConflictException('User is already your friend');
    }

    // Check if request already sent from this user
    const sentRequest = await this.getFriendRequest(userId, friendId);
    const hasSentRequest = !!sentRequest;

    // Check if request already received from this friend
    const receivedRequest = await this.getFriendRequest(friendId, userId);
    const hasReceivedRequest = !!receivedRequest;

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      message: 'User found',
      user: userWithoutPassword,
      isFriend: false,
      hasSentRequest,
      hasReceivedRequest,
      friendshipStatus: friendship?.status || null,
      canSendRequest: !hasSentRequest && !hasReceivedRequest,
    };
  }

  // Helper methods
  private async getFriendship(userId1: string, userId2: string) {
    const key = `friendship:${userId1}:${userId2}`;
    return this.redisService.getData(key);
  }

  private async getFriendRequest(fromUserId: string, toUserId: string) {
    const keys = await this.redisService.getKeys();
    const requestKeys = keys.filter((key) => key.startsWith('friendRequest:'));

    for (const key of requestKeys) {
      const request = await this.redisService.getData(key);
      if (
        request &&
        request.fromUserId === fromUserId &&
        request.toUserId === toUserId &&
        request.status === 'pending'
      ) {
        return request;
      }
    }
    return null;
  }

  private async addToUserRequests(
    userId: string,
    requestId: string,
    type: 'sent' | 'received',
  ) {
    const key = `userRequests:${userId}:${type}:${requestId}`;
    await this.redisService.setData(key, { requestId });
  }
}
