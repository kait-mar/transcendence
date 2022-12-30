import { PassportStrategy } from '@nestjs/passport'
import { Inject, Injectable,
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException
} from '@nestjs/common'
import { Strategy, Profile } from 'passport-42'
import { AuthenticationProvider } from '../services/auth/auth';
import { UserDetails } from 'src/utils/types';
import { TwoFactorAuthenticationService } from '../services/auth/twoFactorAuthentication.service';
import { Response } from 'express';
import { ForbiddenException, UnauthorizedException} from '@nestjs/common';



@Injectable()
export class IntraStrategy extends PassportStrategy(Strategy)
{
    constructor (@Inject('AUTH_SERVICE')
        private readonly authService : AuthenticationProvider){
        super({
            clientID: process.env.INTRA_CLIENT_ID,
            clientSecret: process.env.INTRA_CLIENT_SECRET,
            callbackURL: 'http://' + process.env.IP_ADDRESS + ':3000/auth/redirect',
            scope: ['public'],
        }
        );
    }
    async validate (  accessToken: string, refreshToken: string, profile: any, cb: any  ) : Promise<any> {
        const userInfo = {
            id : profile.id, 
            login: profile._json.login,
            firstName: profile._json.first_name,
            lastName: profile._json.last_name,
            email: profile._json.email,
            displayname: profile._json.displayname,
            avatar: profile._json.image.link,
            twoFactorAuthenticationSecret: null,
            isTwoFactoAuthenticationEnabled: false,
        };
        const validateUser = await this.authService.validateUser(userInfo);
        return (validateUser);
    } 
}


  
  @Catch(UnauthorizedException)
  export class ViewAuthFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
      
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const status = exception.getStatus();
  
      response.status(status).redirect('/auth/red');
    }
  }