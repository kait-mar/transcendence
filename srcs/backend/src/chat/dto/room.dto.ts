// import { ChatMessage } from '../entity/message.entity';
// import { ChatRoom } from '../entity/room.entity';
// import { User } from '../../typeOrm/entities/User';
import { User } from '../../typeOrm/entities/User';
import { ChatRoom } from '../typeOrm/entity/room.entity';
import { ChatMessage } from '../typeOrm/entity/message.entity';

export class BanDto {
	banned: User;
	bannedIn: ChatRoom;
	until: Date;
  }
  
  export type roomType = 'private' | 'public' | 'protected' | 'privategroup';
  
  export class RoomDto {
	cid: string;
	type: roomType;
	owner: string;
	messages: ChatMessage[];
	createdAt: Date;
	name: string;
	password?: string;
	admins: User[];
	banned: User[];
	description: string;
	members: User[];
  }