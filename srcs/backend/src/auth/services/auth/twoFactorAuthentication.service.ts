import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { User} from '../../../typeOrm/entities/User';
import { AuthService } from './auth.service';
import { Response } from 'express';
import {toFileStream} from 'qrcode'
import { AuthenticationProvider } from './auth';
import { use } from 'passport';
 
@Injectable()
export class TwoFactorAuthenticationService {
  constructor (
    @Inject('AUTH_SERVICE')
    private readonly usersService: AuthenticationProvider,
    private readonly configService: ConfigService
  ) {}
 
  public async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'), secret);
    await this.usersService.setTwoFactorAuthenticationSecret(secret, user.id, user);
 
    return {
      secret,
      otpauthUrl
    }
    }
    public async piperQrCodeStream(stream: Response, otpauthUrl: string )
    {
        return toFileStream(stream, otpauthUrl);
    }
  public isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user:User)
    {
        return authenticator.verify({
            token: twoFactorAuthenticationCode,
            secret: user.twoFactorAuthenticationSecret,
        })
    }
}