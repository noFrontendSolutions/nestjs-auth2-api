import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  //second argument of PassportStrategy refers to AuthGuard("jwt") in the protected routes (could be any keyword)
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  //the "sub" field is convention for "id" and comes from the createToken function in auth.service.ts whixh creates the payload from the id and email field during login/signup.
  async validate(payload: { sub: number; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    delete user.password;
    return { user, payload };
  }
}
//NOTE!!!!! For some reason the "sub" field doesn't get attached to the payload, which is why I have to identify user via email.
