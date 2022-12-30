import {
Controller,
Get,
UseGuards,
Request,
Param,
Post,
Body,
UnauthorizedException,
Delete,
Query,
BadRequestException,
Req,
HttpException,
HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { RoomDto } from '../dto/room.dto';
import { ChatRoom } from '../typeOrm/entity/room.entity';
import { ChatService } from './chat.service';
import { AuthenticatedGuard, IntraAuthGuard } from 'src/auth/guards';

@Controller('chat')
@UseGuards(AuthenticatedGuard)
export class ChatController {
	constructor(private chatService: ChatService) {}

	@Get('getallUsers')
	@UseGuards(AuthenticatedGuard)
	async getAllUsers() {
		return this.chatService.getAllUsers();
	}

	@Get('getallUsersFull')
	@UseGuards(AuthenticatedGuard)
	async getAllUsersFull() {
		return this.chatService.getAllUsersFull();
	}

	@Get("GetContactsAndRooms")
	@UseGuards(AuthenticatedGuard)
	async getContactsAndRooms (@Query("login") login:string) {
		return this.chatService.GetContactsAndRooms(login);
	}

	@Get("GetContactOrRoomByCid")
	@UseGuards(AuthenticatedGuard)
	async GetContactOrRoomByCid (@Query("login") login:string, @Query('cid') cid:string) {
		let contactsNRooms = await this.chatService.GetContactsAndRooms(login);
		return await contactsNRooms.find((room) => room.roomObj.cid == cid);
	}


	@Get("getConversations")
	@UseGuards(AuthenticatedGuard)
	async GetAllConvs(@Query("login") login:String) {
		return this.chatService.GetAllConvs(login);
	}
	// Search For Room By name
	@Get('findRoom')
	@UseGuards(AuthenticatedGuard)
	async searchByname(@Query('name') name: string): Promise<ChatRoom[]> {
		return this.chatService.searchByname(name);
	}

	@Get('findRoomMembers')
	@UseGuards(AuthenticatedGuard)
	async FindRoomMembers(@Query('name') name: string) {
		return this.chatService.findRoomMembers(name) 
	}

	// Search For Room By name
	@Get('findRoomCid')
	@UseGuards(AuthenticatedGuard)
	async getRoomCid(@Query('name') name: string): Promise<string> {
		return this.chatService.getRoomCidByName(name);
	}

	// set as Admin in chatRoom
	@Post('setAdmin')
	@UseGuards(AuthenticatedGuard)
	async setAdmins(
		@Body() data: { cid: string; uid: string },
		@Request() req,
	): Promise<void> {
		const userId: string = req.user.login;
		const chatRoom: string = data.cid;
		const newAdmin: string = data.uid
		if (!userId || !chatRoom || !newAdmin) throw new UnauthorizedException();
		return this.chatService.setAdmin(userId, chatRoom, newAdmin);
	}

	@Get('isAdmin')
	async isAdmin(
		@Query("cid") cid:string, @Query('login') login:string,
		@Request() req)
		{
			const userId: string = req.user.login;
			return this.chatService.isAdmin(cid, login);
		}

	@Post('deleteAdmin')
	async removeAdmin(
		@Body() data: { cid: string; uid: string },
		@Request() req,
	): Promise<void> {
	  const userId: string = req.user.login;
	  const chatRoom: string = data.cid;
	  const deletedAdmin: string = data.uid;
  
	  if (!userId || !chatRoom || !deletedAdmin) throw new UnauthorizedException();

	  return this.chatService.removeAdmin(userId, chatRoom, deletedAdmin);
	}

	@Post('addMember')
	@UseGuards(AuthenticatedGuard)
	async addmembers(
		@Body() data: { cid: string; members: string[] },
		@Request() req,
	): Promise<void> {
		const userId = req.user.login;
		const chatRoom = data.cid;
		const newMembers = data.members;  
		if (!userId) throw new UnauthorizedException();
		else if (!chatRoom || !newMembers) throw new BadRequestException();
		
		return this.chatService.setMembers(userId, chatRoom, newMembers);
	}

	@Post('addMemberNoAdminCheck')
	@UseGuards(AuthenticatedGuard)
	async addmembersNoAdminCheck(
		@Body() data: { cid: string; members: string[] },
		@Request() req,
	): Promise<void> {
		const userId = req.user.login;
		const chatRoom = data.cid;
		const newMembers = data.members;  
		if (!userId) throw new UnauthorizedException();
		else if (!chatRoom || !newMembers) throw new BadRequestException();
		return this.chatService.setMembersNoAdminCheck(userId, chatRoom, newMembers);
	}

	@Post('removeMember')
	@UseGuards(AuthenticatedGuard)
	async removeMember(
		@Body() data: { cid: string; uid: string },
		@Request() req,
	): Promise<void> {
		const userId: string = req.user.login;
		const chatRoom: string = data.cid;
		const deleteMember: string = data.uid;

		if (!userId || !chatRoom || !deleteMember)
		throw new UnauthorizedException();
		
		return this.chatService.removeMember(userId, chatRoom, deleteMember);
	}

	// ban user from chat room
	@Post('ban')
	@UseGuards(AuthenticatedGuard)
	async setbanned(
		@Body() data: { cid: string; uid: string },
		@Request() req,
	): Promise<void> {
		const userId: string = req.user.login;
		const chatRoom: string = data.cid;
		const banned: string = data.uid;

		if (!userId || !chatRoom || !banned) throw new BadRequestException();

		return this.chatService.ban(userId, chatRoom, banned);
	}

	@Post('unban')
	@UseGuards(AuthenticatedGuard)
	async setunbanned(
		@Body() data: { cid: string; uid: string },
		@Request() req,
	): Promise<void> {
		const userId: string = req.user.login;
		const chatRoom: string = data.cid;
		const banned: string = data.uid;

		if (!userId || !chatRoom || !banned) throw new BadRequestException();

		return this.chatService.unban(userId, chatRoom, banned);
	}

	// mute user
	@Post('mute')
	@UseGuards(AuthenticatedGuard)
	async muteUser(
		@Body() data: { cid: string; uid: string; minutes: number },
		@Request() req,
	): Promise<void> {

		function isFloat(n:number) {
			return n === +n && n !== (n|0);
		}
		const userId: string = req.user.login;
		const chatRoom: string = data.cid;
		const muted: string = data.uid;
		const mutePeriod: number = data.minutes;

		if (isFloat(mutePeriod)) throw new BadRequestException();
		if (!userId || !chatRoom || !muted) throw new BadRequestException();
		return this.chatService.muteUpgraded(userId, chatRoom, muted , mutePeriod);
	}

	@Post('unmute')
	@UseGuards(AuthenticatedGuard)
	async unmuteUser(
		@Body() data: { cid: string; uid: string; },
		@Request() req,
	): Promise<void> {
		const userId: string = req.user.login;
		const chatRoom: string = data.cid;
		const muted: string = data.uid;

		if (!userId || !chatRoom || !muted) throw new BadRequestException();
		return this.chatService.unmute(userId, chatRoom, muted);
	}

	@Get('mutedUsers')
	@UseGuards(AuthenticatedGuard)
	async getMutedUsers (@Param('cid') cid: string,
	)
	{
		return this.chatService.getMutedUsers(cid);
	}

	@Get('bannedUsers')
	@UseGuards(AuthenticatedGuard)
	async getBannedUsers (@Query('cid') cid: string,
	)
	{
		return this.chatService.getBannedUsers(cid);
	}

	// add members to chat room, join rooms

	@Post('joinRoom')
	@UseGuards(AuthenticatedGuard)
	async joinAsMember(
		@Request() req,
		@Body() data: { roomId: string; password: string },
	) {
		const userId: string = req.user.login;
		const chatRoom: string = data.roomId;
		const hash: string = data.password;

		if (!userId || !chatRoom) throw new UnauthorizedException();

		return this.chatService.joinRoomAsMember(userId, chatRoom, hash);
	}

	@Post('leaveRoom')
	@UseGuards(AuthenticatedGuard)
	async leaveRoom(@Request() req, @Body() data: { cid: string }) {
		const uid: string = req.user.login;
		const cid: string = data.cid;
		if (!uid || !cid) throw new UnauthorizedException();

		return this.chatService.leaveRoom(uid, cid);
	}

	// remove room

	@Delete('/rooms/:id')
	@UseGuards(AuthenticatedGuard)
	async deleteRoom(@Request() req, @Param('id') id: string) {
		const userId: string = req.user.login;
		const chatRoom: string = id;
		if (!userId || !chatRoom) throw new UnauthorizedException();
		return this.chatService.deleteRoom(userId, chatRoom);
	}

	@Post('updateRoomPWD')
	@UseGuards(AuthenticatedGuard)
	async updatePassword(
		@Request() req,
		@Body()
		data: { cid: string; oldPass: string; newPass: string },
	) {
		const userId = req.user.login;
		return this.chatService.updateRoomPass(userId, {
		cid: data.cid,
		oldPass: data.oldPass,
		newPass: data.newPass,
		});
	}

	@Post('deleteRoomPWD')
	@UseGuards(AuthenticatedGuard)
	async deletePassword(
		@Request() req,
		@Body() data: { cid: string; oldPass: string },
	) {
		const userId = req.user.login;
		return this.chatService.deleteRoomPass(userId, data.cid, data.oldPass);
	}

	@Post('createRoom')
	@UseGuards(AuthenticatedGuard)
	async createRoom(
		@Request() req,
		@Body() createRoom: RoomDto,
	): Promise<void> {
		await this.chatService.createRoom(createRoom);
		return;
	}

	@Get('/messages/:roomname')
	@UseGuards(AuthenticatedGuard)
	async getAllMessages(@Param('roomname') roomName: string, @Req() req) {
		if (!roomName) throw new BadRequestException('specify room name');
		const userId: string = req.user?.login;
		return this.chatService.findAllMessages(userId, roomName);
	}

	@Get('rooms')
	@UseGuards(AuthenticatedGuard)
	async getAllRooms(@Request() req) {
		return this.chatService.findAllRooms(req.user.login);
	}

	@Get(':cid')
	@UseGuards(AuthenticatedGuard)
	async getRoomBycid(@Req() req, @Param('cid') cid: string) {
		return this.chatService.findOne(req.user.login, cid);
	}

	@Post('changeRoomState')
	async changeRoomState(
	  @Request() req,
	  @Body() data: { initState:string,  finalState: string, password:string,  cid:string  }
	)
	 {
		if (!data.initState  || !data.finalState) throw new BadRequestException('initial state or final state empty');
		if (data.initState == 'protected' && data.finalState == 'protected' && !data.password)  throw new BadRequestException("you can't change password with an empty password");
	  const login = req.user.login;
	  return this.chatService.changeRoomState(login, data.initState, data.finalState, data.password, data.cid);
	}	


}
