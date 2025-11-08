import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NoteService {
  constructor(
    @Inject('CALENDAR_EVENT_SERVICE') private calendarEventClient: ClientProxy,
  ) {}

  async create(createNoteDto: CreateNoteDto) {
    try {
      const result = await firstValueFrom(
        this.calendarEventClient.send('createCalendarEvent', createNoteDto),
      );
      return {
        message: 'Note created and calendar event added',
        note: createNoteDto,
        calendarEvent: result,
      };
    } catch (error) {
      throw new Error(`Failed to create calendar event: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const events = await firstValueFrom(
        this.calendarEventClient.send('findAllCalendarEvent', {}),
      );
      return {
        message: 'All notes/calendar events retrieved',
        events,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve calendar events: ${error.message}`);
    }
  }

  async findByCustomerId(customerId: string) {
    try {
      const events = await firstValueFrom(
        this.calendarEventClient.send('findAllCalendarEvent', {}),
      );
      const customerEvents = Array.isArray(events)
        ? events.filter((event) => event?.customerId === customerId)
        : [];
      return customerEvents;
    } catch (error) {
      throw new Error(
        `Failed to retrieve calendar events for customer: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const event = await firstValueFrom(
        this.calendarEventClient.send('findOneCalendarEvent', id),
      );
      return {
        message: 'Note/calendar event retrieved',
        event,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve calendar event: ${error.message}`);
    }
  }

  async update(id: string, updateNoteDto: UpdateNoteDto) {
    try {
      const result = await firstValueFrom(
        this.calendarEventClient.send('updateCalendarEvent', {
          id,
          ...updateNoteDto,
        }),
      );
      return {
        message: 'Note updated and calendar event updated',
        result,
      };
    } catch (error) {
      throw new Error(`Failed to update calendar event: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const result = await firstValueFrom(
        this.calendarEventClient.send('removeCalendarEvent', id),
      );
      return {
        message: 'Note removed and calendar event deleted',
        result,
      };
    } catch (error) {
      throw new Error(`Failed to remove calendar event: ${error.message}`);
    }
  }
}
