import { Module, UseFilters } from '@nestjs/common';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './services/auth/auth.service';
import { AuthenticatedGuard, IntraAuthGuard } from './guards';
import { PassportModule} from '@nestjs/passport'
import { IntraStrategy } from './strategies';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../typeOrm';
import { SessionSerializer } from './utils/Serializer';
import { TwoFactorAuthenticationService } from './services/auth/twoFactorAuthentication.service';
import { ConfigModule } from '@nestjs/config';
import { Friend } from 'src/typeOrm/entities/FriendRequest';
import { FriendController } from './controllers/auth/firend.controller';
import { FriendServices } from './services/friend/friend.service';
import { AuthGateWayGateway } from './auth-gate-way.gateway';
import { ChatGateway } from 'src/chat/src/chat.gateway';
import { ChatService } from 'src/chat/src/chat.service';
import {HttpModule} from '@nestjs/axios'

@Module({
  imports: [ConfigModule.forRoot({envFilePath: '../.env.devlopement'}),
    HttpModule,
    PassportModule.register({session: true}),
    ConfigModule,
    TypeOrmModule.forFeature([User, Friend])
  ],
  controllers: [AuthController, FriendController],
  providers: [IntraAuthGuard, IntraStrategy,
    AuthenticatedGuard,
    TwoFactorAuthenticationService,
    FriendServices,
    SessionSerializer,
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthService,
    },
    AuthGateWayGateway,
  ],
  
})
export class AuthModule {}
