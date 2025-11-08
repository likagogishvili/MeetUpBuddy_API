import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { CustomerService } from 'src/customer/customer.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly customerService: CustomerService) {}

  async signIn(signInDto: SignInDto) {
    const customer = await this.customerService.findByEmail(signInDto.email);

    if (!customer) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      signInDto.password,
      customer.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...customerWithoutPassword } = customer;

    return {
      message: 'Sign in successful',
      customer: customerWithoutPassword,
    };
  }
}
