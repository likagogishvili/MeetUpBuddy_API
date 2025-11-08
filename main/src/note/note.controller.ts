import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@ApiTags('notes')
@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note and calendar event' })
  @ApiResponse({
    status: 201,
    description: 'Note and calendar event created successfully',
  })
  create(@Body() createNoteDto: CreateNoteDto) {
    return this.noteService.create(createNoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notes/calendar events' })
  @ApiResponse({
    status: 200,
    description: 'List of all notes/calendar events',
  })
  findAll() {
    return this.noteService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a note/calendar event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Note/calendar event found',
  })
  @ApiResponse({
    status: 404,
    description: 'Note/calendar event not found',
  })
  findOne(@Param('id') id: string) {
    return this.noteService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a note and calendar event' })
  @ApiResponse({
    status: 200,
    description: 'Note and calendar event updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Note/calendar event not found',
  })
  update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.noteService.update(id, updateNoteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a note and calendar event' })
  @ApiResponse({
    status: 200,
    description: 'Note and calendar event deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Note/calendar event not found',
  })
  remove(@Param('id') id: string) {
    return this.noteService.remove(id);
  }
}
