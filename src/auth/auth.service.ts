import { ForbiddenException, Injectable } from '@nestjs/common';
import { LoginDto, SignUpDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
//argon2 is used for password hashing
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  // although not imported in auth.module, the PrismaService class is available here because it's been exported Globally from prisma.module.ts
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new ForbiddenException('Error: User does not exist.');
    }

    const isPasswordMatch = await argon.verify(
      user.password,
      loginDto.password,
    );
    if (!isPasswordMatch) {
      throw new ForbiddenException('Error: Password does not match.');
    }

    delete user.password;
    return { token: await this.createToken(loginDto.id, loginDto.email), user };
  }

  async signUp(signUpDto: SignUpDto) {
    const hash = await argon.hash(signUpDto.password);

    try {
      const user = await this.prisma.user.create({
        data: { ...signUpDto, password: hash },
      });
      delete user.password;
      return {
        token: await this.createToken(signUpDto.id, signUpDto.email),
        user,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException(
          'Error: Credentials have already been asigned.',
        );
      } else {
        throw error;
      }
    }
  }

  async createToken(userId: number, email: string) {
    //the payload object gets passed along in all the protected routes, like "/users/dashboard"
    const payload = { sub: userId, email: email };
    return await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: this.config.get('JWT_SECRET'),
    });
  }
}
