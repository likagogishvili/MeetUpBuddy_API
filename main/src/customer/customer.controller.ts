import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('customers')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Register/Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer registered successfully',
  })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({
    status: 200,
    description: 'List of all customers',
  })
  findAll() {
    return this.customerService.findAll();
  }

  @Get(':id/notes')
  @ApiOperation({ summary: 'Get customer with their notes/calendar events' })
  @ApiParam({ name: 'id', description: 'Customer ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Customer with notes retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  findOneWithNotes(@Param('id') id: string) {
    return this.customerService.findOneWithNotes(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Customer found',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer information' })
  @ApiParam({ name: 'id', description: 'Customer ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiParam({ name: 'id', description: 'Customer ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Customer deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
}
