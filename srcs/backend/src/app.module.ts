import { Gateway } from './notification/notification.gateway';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { User } from './typeOrm';
import { PassportModule } from '@nestjs/passport';
//import { Friend } from './typeOrm/entities/FriendRequest';
import { Friend } from './typeOrm/entities/FriendRequest';
import { GameModule } from './game/game.module';
import { NotificationController } from './notification/notification.controller';
import { NotificationModule } from './notification/notification.module';
import { UserStatusGateway } from './userStatus/user-status.gateway';
import { ChatModule } from './chat/src/chat.module';
import { ChatService } from './chat/src/chat.service';
import { MuteService } from './chat/src/mute.service';
import { Mute } from './chat/typeOrm';
import { ChatRoom } from './chat/typeOrm';
import { ChatMessage } from './chat/typeOrm';
@Module({
  imports: [ConfigModule.forRoot({ envFilePath: '.env.devlopement', isGlobal: true }),
    UsersModule, AuthModule,
  PassportModule.register({ session: true }),
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.PG_DB_Host,
    port: Number.parseInt(process.env.PG_DB_PORT),
    username: process.env.PG_DB_USER,
    password: process.env.PG_DB_PASS,
    database: process.env.PG_DB_NAME,
    entities: [User, Friend, ChatRoom, ChatMessage, Mute],
    synchronize: true,
  }), GameModule, NotificationModule, ChatModule],
  controllers: [NotificationController],
  providers: [
    Gateway,
    UserStatusGateway,
  ],
})
export class AppModule { }