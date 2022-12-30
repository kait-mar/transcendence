import { OnGatewayConnection,OnGatewayInit, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { FriendServices } from '../../auth/services/friend/friend.service';
import { ChatMessageDto } from '../dto/message.dto';
import { RoomDto } from '../dto/room.dto';
import { User } from '../../typeOrm/entities/User';
import { Repository } from 'typeorm';
import { ChatRoom } from '../typeOrm/entity/room.entity';
import { ChatMessage } from '../typeOrm/entity/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger  } from '@nestjs/common';

@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway implements OnGatewayInit,OnGatewayConnection, OnGatewayDisconnect {
	private logger: Logger = new Logger('ChatGateway');
	constructor
	(
		private readonly chatService:ChatService,
		private readonly friendService:FriendServices, 
		@InjectRepository(User)
		private readonly userRepo:Repository<User>
	){}

	afterInit(server: Server) {
		// this.logger.log('Game initialized');
	}

	@WebSocketServer() 
	private server: Server;
	private userLoginToSocketId: Map<string, string> = new Map<string, string>();

	@SubscribeMessage('_disconnect')
	disconnection (client: Socket) {
		client.disconnect();
	}

	handleDisconnect(client: Socket)
	{
		this.logger.log(`client disconnected : ${(client.id)}`);
		const login: string =  client.handshake.query.user_login as string;
		this.userLoginToSocketId.delete(login);
	}

	handleConnection(client: any, ...args: any[]) {
		this.logger.log(`client [${client.id}] Connected`);
		this.userLoginToSocketId.set(client.handshake.query.user_login, client.id);
	 }

	@SubscribeMessage('createRoom')
	async createRoom(client:Socket, roomName:string):Promise<ChatRoom>
	{
		const room:ChatRoom = new RoomDto();
		const login: string =  client.handshake.query.user_login as string;
		const user:User = await this.userRepo.findOne({
			where: {login: login},
		});
		room.name = roomName;
		room.admins = [user];
		room.banned = [];
		room.owner = login;
		room.type = 'public';
		this.server.emit('RoomCreated', roomName);
		return this.chatService.createRoom(room);
	}
	
	@SubscribeMessage('createPrivateRoom')
	async createPrivateRoom(client:Socket, data: {receiver:string}):Promise<any>
	{
		const login: string =  client.handshake.query.user_login as string;
		const room = await this.chatService.findOrCreatePrivateRoom([
			login,
			data.receiver,
		  ]);
		this.server.to(client.id).emit('privateRoomCreated', room);
		return room;
	}

	@SubscribeMessage('msgToServer')
	async create(
		client:Socket,
		message: {room:string, message:string},
	):Promise<ChatMessage>
	{
		const chatMessage:ChatMessage = new ChatMessageDto();
		let login = client.handshake.query.user_login as string;
		const user:User = await this.userRepo.findOne({
			where: {login: login},
		});
		chatMessage.ownerId = user.table_id.toString()
		let room = await this.chatService.findRoomById(message['room']);
		if (!room && (message['room'] === 'public'))
			room = await this.createRoom(client, message['room']);
		if (!message['message'].length) 
			return;

		chatMessage.roomId = room.cid;
		chatMessage.username = user.displayname;
		chatMessage.text = message['message'];

		// const blockedByList = await this.friendService.blockedByWho(user);
		const blockedByList = await this.friendService.blockedBy(user);
		const bannedList = await this.chatService.getBannedUsers(room.cid);
		console.log(blockedByList)
		this.server.to(message['room'])
		.except([
			client.id,
			...blockedByList.map((u) => {
			  return this.userLoginToSocketId.get(u.login);
			}),
			...bannedList.map((u) => {
			  return this.userLoginToSocketId.get(u.login);
			}),
		])
		.emit('msgToClient', {
			ownerId: chatMessage.ownerId,
			username: user.displayname,
			text: message['message'],
			nickname: user.nickName,
			roomCid: message['room']
		});
		return this.chatService.create(chatMessage);
	}

	@SubscribeMessage('join')
	handlejoin(client:Socket, 	message: {room:string})
	{
		client.join(message.room);
		this.server.emit('client joined')
	}

	@SubscribeMessage('leave')
	handleleave(client:Socket, 	message: {room:string})
	{
		client.leave(message.room);
		this.server.emit('client left')
	}


	@SubscribeMessage('leaveRoomToServer')
	leaveRoom(client:Socket, room:string)
	{
		client.leave(room);
		return room;
	}

	@SubscribeMessage('messageToRoom')
	async messageToRoom(client:Socket, body:any)
	{
		const chatMessage:ChatMessage = new ChatMessageDto();
		const login:string = client.handshake.query.user_login as string;
		const room = await this.chatService.findOne(login, body[1]);
		if (!room)
			throw new WsException('room  not found');
		if (room.banned.find( (u) => { return u.login  == login; } ))
			throw new WsException('banned from room');
		chatMessage.ownerId = login;
		chatMessage.roomId = body[1];
		chatMessage.text = body[0];
		chatMessage.username = login;
		this.server.to(body[0]).emit('msgToClientifRoom', body[1]);
		return this.chatService.create(chatMessage);
	}

	@SubscribeMessage('findAllRooms')
	async findAllRooms(client: Socket) {
		return await this.chatService.findAllRooms(client.data.user.uid);
	}

	@SubscribeMessage('findAllChat')
	async findAll() {
		return this.chatService.findAll();
	}

	@SubscribeMessage('hello')
	async printHello() {
	}

	@SubscribeMessage('findOneChat')
	async findOne(client: Socket, id: string) {
		return this.chatService.findOne(client.data.user.uid, id);
	}

	@SubscribeMessage('removeChat')
	async remove(id: string) {	
		return this.chatService.remove(id);
	}

	@SubscribeMessage('updateRoom')
	async updateRoom(client: any, payload:any)
	{
		this.server.emit('roomUpdated', payload)
	}

	@SubscribeMessage('updateRooms')
	async updateRooms(client: any, payload:any)
	{
		this.server.emit('roomsUpdated', payload)
	}

	@SubscribeMessage('promptPasswordOn')
	async promptPasswordOn(client: any, payload:any)
	{
		this.server.emit('promptPasswordOn', payload)
	}

	@SubscribeMessage('promptPasswordOff')
	async promptPasswordOff(client: any, payload:any)
	{
		this.server.emit('promptPasswordOff', payload)
	}

	@SubscribeMessage('messageSent')
	async messageRecieved(client: any, payload:any)
	{
		// let msgs = await this.chatService.findAllMessages(payload.login, payload.roomName);
		this.server.emit('messageRecieved', payload)
	}

	@SubscribeMessage('memberLeft')
	async memberLeft(client: any, payload:any)
	{
		this.server.emit('memberLeft', payload)
	}
	@SubscribeMessage('promptMuteAmount')
	async promptMuteAmount(client: any, payload:any)
	{
		this.server.emit('promptMuteAmount', payload)
	}

	@SubscribeMessage('updateMuteMembers')
	async updateMuteMembers(client: any, payload:any)
	{
		this.server.emit('updateMuteMembers', payload)
	}
	@SubscribeMessage('banUser')
	async banUser(client: any, payload:any)
	{
		this.server.emit('banUser', payload)
	}

	@SubscribeMessage('selectRoom')
	async selectRoom(client: any, payload:any)
	{
		this.server.emit('roomSelected', payload)
	}
	
	@SubscribeMessage('removeMember')
	async removeMember(client: any, payload:any)
	{
		this.server.emit('removeMember', payload)
	}

}

function callback(arg0: { status: string; }) {
	throw new Error('Function not implemented.');
}
