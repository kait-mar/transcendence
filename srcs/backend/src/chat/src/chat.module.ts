import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MuteService } from './mute.service';
import { Mute } from '../typeOrm';
import { User } from '../../typeOrm';
import { ChatRoom } from '../typeOrm';
import { ChatMessage } from '../typeOrm';
import { AuthModule } from '../../auth/auth.module';
import { FriendServices } from '../../auth/services/friend/friend.service';
import { Friend } from "src/typeOrm/entities/FriendRequest";



@Module({
	imports:[TypeOrmModule.forFeature([User, ChatRoom, ChatMessage, Mute, Friend]),
		AuthModule,
	],
	providers: [ChatGateway, ChatService, MuteService, FriendServices],
	controllers: [ChatController],
	exports: [ChatGateway, ChatService],
})
  
export class ChatModule {}