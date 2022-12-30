import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  HttpException,
  HttpStatus,
  HttpVersionNotSupportedException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ChatMessageDto } from '../dto/message.dto';
import { RoomDto } from '../dto/room.dto';
import { User } from '../../typeOrm/entities/User';
import { ChatRoom } from '../typeOrm/entity/room.entity';
import { ChatMessage } from '../typeOrm/entity/message.entity';
import { MuteService } from './mute.service';
import { Mute } from '../typeOrm';
import { ChatGateway } from './chat.gateway';
import { last } from 'rxjs';
import { rm } from 'fs';
import { resolve } from 'path/posix';
import { type } from 'os';

type message = {
  text: string;
  date: Date;
  username: string;
  ownerId: string;
};

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatMessageRepo: Repository<ChatMessage>,
    @InjectRepository(ChatRoom)
    private chatRoomRepo: Repository<ChatRoom>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Mute)
    private muteRepo: Repository<Mute>,
    // @Inject(ChatGateway)
    // private readonly chatGateway: ChatGateway,
    private muteService: MuteService,
  ) {}

  async getAllUsers() {
    const usrs: User[] = await this.userRepo.find();
    return usrs;
  }
  async getAllUsersFull() {
    const usrs: User[] = await this.userRepo.find();
    return usrs;
  }

  async GetContactsAndRooms(login: string) {
    const users = await this.userRepo.find();
    const usersLogins = users.map((user) => user.login);
    const contactsAndRooms = [];
    let alteredLogin = '';

    for (let i = 0; i < usersLogins.length; i++) {
      for (let j = i + 1; j < usersLogins.length; j++) {
        if (
          (await this.chatRoomRepo.findOne({
            where: {
              name: `${usersLogins[i]}-667-${usersLogins[j]}`,
            },
          })) ||
          (await this.chatRoomRepo.findOne({
            where: {
              name: `${usersLogins[j]}-667-${usersLogins[i]}`,
            },
          }))
        )
          continue;
        const newRoom = this.chatRoomRepo.create({
          type: 'privategroup',
          name: `${usersLogins[i]}-667-${usersLogins[j]}`,
          admins: [],
          banned: [],
          description: '',
          members: [users[i], users[j]],
          password: '',
          owner: `${usersLogins[i]}-667-${usersLogins[j]}`,
        });
        await this.chatRoomRepo.save(newRoom);
      }
    }

    const rooms = await this.chatRoomRepo.find({
      relations: ['members', 'admins', 'banned', 'messages'],
    });
    rooms.map((room) => {
      if (
        room.members.find((member) => member.login == login) ||
        room.type == 'public' ||
        room.type == 'protected'
      ) {
        contactsAndRooms.push({
          name: room.name,
          roomType: room.type,
          alteredName:
            room.type == 'privategroup'
              ? room.members[0].login == login
                ? room.members[1].login
                : room.members[0].login
              : room.name,
          roomObj: room,
          ContactNickName:
          room.type == 'privategroup'
          ? room.members[0].login == login
            ? room.members[1].nickName
            : room.members[0].nickName
          : room.name, 
        });
      } else if (
        room.type == 'private' &&
        room.members.find((member) => member.login == login)
      ) {
        contactsAndRooms.push({
          name: room.name,
          roomType: room.type,
          alteredName: room.name,
          roomObj: room,
          
        });
      } 
    });
    return contactsAndRooms;
  }

  async GetAllConvs(login: String) {
    const msgs = await this.chatMessageRepo.find();
    const rooms = await this.chatRoomRepo.find({
      relations: ['members', 'admins', 'banned'],
    });
    const latestMsgsRoomsSet = new Set();
    const nonDupMsgs = [];
    const cnvs = [];
    // const getAlteredName(arr)
    msgs.reverse().map((msg) => {
      if (!latestMsgsRoomsSet.has(msg.roomId)) nonDupMsgs.push(msg);
      latestMsgsRoomsSet.add(msg.roomId);
    });

    nonDupMsgs.map(async (msg) => {
      let roomMatched = rooms.find((room) => {
        return (
          room.cid == msg.roomId && 
          room.members.find((member) => member.login == login)
        );
      });
      if (roomMatched)
        cnvs.push({
          name: roomMatched.name,
          roomType: roomMatched.type,
          // roomName: roomMatched?.name,
          alteredName:
            roomMatched.type == 'privategroup'
              ? roomMatched.members[0].login == login
                ? roomMatched.members[1].login
                : roomMatched.members[0].login
              : roomMatched?.name,
          // roomName: roomMatched.name,
          // roomName: (await this.chatRoomRepo.findOne({where: {cid: msg.roomId}}))?.name,
          msg: msg.text,
          roomObj: roomMatched,
          ContactNickName:
          roomMatched.type == 'privategroup'
          ? roomMatched.members[0].login == login
            ? roomMatched.members[1].nickName
            : roomMatched.members[0].nickName
          : roomMatched.name, 
        });
    });

    // rooms.map((room) => {
    // 	if (room.members.find((member) => member.login == login))
    // 	{

    // 	}
    // })
    return cnvs;
  }

  async findOrCreatePrivateRoom(users: string[]) {
    const members: User[] = await this.userRepo.find({
      where: [{ login: users[0] }, { login: users[1] }],
    });
    const chatRooms: ChatRoom[] = await this.chatRoomRepo.find({
      where: [{ type: 'private' }],
      relations: ['members', 'messages'],
    });
    const room = chatRooms.filter((c) => {
      return (
        c.members.filter((m) => {
          return m.login == users[0] || m.login == users[1];
        }).length == 2
      );
    });
    if (!room.length) {
      const r = await this.chatRoomRepo.save({
        members: members,
        admins: members,
        banned: [],
        name: '',
        owner: users[0],
        type: 'private',
      });
      return this.chatRoomRepo.save({ ...r, name: r.cid });
    } else return { ...room[0], messages: room[0].messages.length };
  }

  async joinRoomAsMember(login: string, roomId: string, password: string) {
    const user: User = await this.userRepo.findOne({ where: { login: login } });
    if (!user) throw new ForbiddenException();
    const chatroom: ChatRoom = await this.chatRoomRepo.findOne({
      where: { cid: roomId },
      relations: ['members', 'banned'],
    });
    if (
      !chatroom ||
      (!(chatroom.type === 'protected') && !(chatroom.type === 'public'))
    )
      throw new ForbiddenException();
    if (chatroom.banned.find((u) => u.login == login))
      throw new ForbiddenException();
    if (chatroom.type === 'protected') {
      const check = await bcrypt.compare(password, chatroom.password);
      if (!check) throw new ForbiddenException('Wrong Password!');
    }
    chatroom.members = [...chatroom.members, user];
    await this.chatRoomRepo.save(chatroom);
  }

  async deleteRoom(login: string, roomId: string) {
    const chatroom: ChatRoom = await this.chatRoomRepo.findOne({
      where: {
        cid: roomId,
      },
      relations: ['members'],
    });
    if (!chatroom || chatroom.owner !== login) throw new ForbiddenException();
    await this.chatRoomRepo.delete(login);
  }

  async setMembers(
    login: string,
    roomId: string,
    members: string[],
  ): Promise<any> {
    const chatroom: ChatRoom = await this.chatRoomRepo.findOne({
      where: {
        cid: roomId,
      },
      relations: ['admins', 'members', 'banned'],
    });
    function notMember(member: User): boolean {
      const found = chatroom.members.find((m) => member.login == m.login);
      return !found;
    }
    function notBanned(member: User): boolean {
      const banned = chatroom.banned.find((m) => member.login == m.login);
      return !banned;
    }
    if (!chatroom) throw new UnauthorizedException();
    const admin = chatroom.admins.find((admin) => {
      return admin.login === login;
    });
    if (admin || chatroom.owner == login) {
      let newMembers = await Promise.all(
        members.map(async (m) => {
          return await this.userRepo.findOne({
            where: { login: m },
          });
        }),
      );
      newMembers = newMembers.filter(notMember);
      newMembers = newMembers.filter(notBanned);
      newMembers = [...chatroom.members, ...newMembers];
      await this.chatRoomRepo.save({
        ...chatroom,
        members: newMembers,
      });
      return;
    }
    return new ForbiddenException();
  }

  async setMembersNoAdminCheck(
    login: string,
    roomId: string,
    members: string[],
  ): Promise<any> {
    const chatroom: ChatRoom = await this.chatRoomRepo.findOne({
      where: {
        cid: roomId,
      },
      relations: ['admins', 'members', 'banned'],
    });
    function notMember(member: User): boolean {
      const found = chatroom.members.find((m) => member.login == m.login);
      return !found;
    }
    function notBanned(member: User): boolean {
      const banned = chatroom.banned.find((m) => member.login == m.login);
      return !banned;
    }
    if (!chatroom) throw new UnauthorizedException();
    const admin = chatroom.admins.find((admin) => {
      return true;
    });
    if (admin || chatroom.owner == login) {
      let newMembers = await Promise.all(
        members.map(async (m) => {
          return await this.userRepo.findOne({
            where: { login: m },
          });
        }),
      );
      newMembers = newMembers.filter(notMember);
      newMembers = newMembers.filter(notBanned);
      newMembers = [...chatroom.members, ...newMembers];
      await this.chatRoomRepo.save({
        ...chatroom,
        members: newMembers,
      });
      return;
    }
    return new ForbiddenException();
  }

  // async removeMember(login:string, roomId:string, deleted:string):Promise<any>
  // {
  // 	const chatroom:ChatRoom = await this.chatRoomRepo.findOne({
  // 		where: {
  // 		  cid:roomId,
  // 		},
  // 		relations: ['admins', 'members'],
  // 	});
  // 	if (!chatroom) throw new UnauthorizedException();

  // 	const admin = chatroom.admins.find((admin) => {
  // 	return admin.login === login;
  // 	});
  // 	const deletedUserAdmin = chatroom.admins.find((admin) => {
  // 	return admin.login === login;
  // 	});
  // 	if (chatroom.owner == login || (admin && !deletedUserAdmin && !(chatroom.owner == login)))
  // 	{
  // 		const r = await this.chatRoomRepo.save({
  // 			...chatroom,
  // 			members: [...chatroom.members.filter((m) => m.login != login)],
  // 			admins: [...chatroom.admins.filter((m) => m.login != login)],
  // 		});
  // 		return;
  // 	}
  // 	return new ForbiddenException();
  // }

  async removeMember(
    login: string,
    roomId: string,
    deleted: string,
  ): Promise<any> {
    const chatroom: ChatRoom = await this.chatRoomRepo.findOne({
      where: {
        cid: roomId,
      },
      relations: ['admins', 'members'],
    });
    if (!chatroom) throw new UnauthorizedException();

    const member: User = await this.userRepo.findOne({
      where: {
        table_id: Number(deleted),
      },
    });

    const admin = chatroom.admins.find((admin) => {
      return admin.login === login;
    });
    const deletedUserAdmin = chatroom.admins.find((admin) => {
      return admin.login === member.login;
    });
    if (
      chatroom.owner == login ||
      (admin && !deletedUserAdmin && !(chatroom.owner == member.login))
    ) {
      const r = await this.chatRoomRepo.save({
        ...chatroom,
        members: [...chatroom.members.filter((m) => m.login != member.login)],
        admins: [...chatroom.admins.filter((m) => m.login != member.login)],
      });
      return;
    }
    return new ForbiddenException();
  }

  async leaveRoom(login: string, roomId: string) {
    const chatRoom: ChatRoom = await this.chatRoomRepo.findOne({
      where: {
        cid: roomId,
      },
      relations: ['members', 'admins'],
    });
    if (!chatRoom) throw new NotFoundException('chat room not found');
    if (chatRoom.owner != login) {
      return await this.chatRoomRepo.save({
        ...chatRoom,
        members: chatRoom.members.filter((mem) => mem.login != login),
        admins: chatRoom.admins.filter((ad) => ad.login != login),
      });
    }
    const updatedRoom = {
      ...chatRoom,
      members: [...chatRoom.members.filter((mem) => mem.login != login)],
      admins: [...chatRoom.admins.filter((ad) => ad.login != login)],
    };
    let newOwner = updatedRoom.admins[0];
    if (!newOwner) newOwner = updatedRoom.members[0];
    if (!newOwner) {
      return await this.deleteRoom(login, roomId);
    }
    await this.chatRoomRepo.save({
      ...updatedRoom,
      owner: newOwner.login,
    });
  }

  async ban(login: string, roomId: string, banned: string): Promise<any> {
    const chatRoom: ChatRoom = await this.chatRoomRepo.findOne({
      where: {
        cid: roomId,
      },
      relations: ['admins', 'banned', 'members'],
    });
    if (!chatRoom) throw new BadRequestException();
    const member: User = await this.userRepo.findOne({
      where: {
        table_id: Number(banned),
      },
    });

    if (
      !chatRoom.admins.find((u) => u.login == login) &&
      chatRoom.owner != login
    )
      throw new UnauthorizedException('not admin');
    if (chatRoom.banned.find((u) => u.login == member.login))
      throw new BadRequestException('already banned');
    const r = await this.chatRoomRepo.save({
      ...chatRoom,
      //   members: chatRoom.members.filter((u) => u.login != member.login),
      admins: chatRoom.admins.filter((u) => u.login != member.login),
      banned: [
        ...chatRoom.banned,
        await this.userRepo.findOneOrFail({ where: { login: member.login } }),
      ],
    });
  }

  async unban(login: string, roomId: string, banned: string): Promise<any> {
    const chatRoom: ChatRoom = await this.chatRoomRepo.findOne({
      where: {
        cid: roomId,
      },
      relations: ['admins', 'banned', 'members'],
    });
    if (!chatRoom) throw new BadRequestException();
    const member: User = await this.userRepo.findOne({
      where: {
        table_id: Number(banned),
      },
    });

    if (
      !chatRoom.admins.find((u) => u.login == login) &&
      chatRoom.owner != login
    )
      throw new UnauthorizedException('not admin');

    if (!chatRoom.banned.find((u) => u.login == member.login))
      throw new BadRequestException('not banned');
    const r = await this.chatRoomRepo.save({
      ...chatRoom,
      //   members: chatRoom.members.filter((u) => u.login != member.login),
      //   admins: chatRoom.admins.filter((u) => u.login != member.login),
      banned: chatRoom.banned.filter(
        (u) => u.login != member.login && u.login != login,
      ),
    });
  }

  async mute(
    login: string,
    roomId: string,
    muted: string,
    minutes: number,
  ): Promise<any> {
    const chatRoom: ChatRoom = await this.chatRoomRepo.findOne({
      where: {
        cid: roomId,
      },
      relations: ['admins', 'members'],
    });
    if (!chatRoom) throw new BadRequestException();

    if (
      !chatRoom.admins.find((u) => u.login == login) &&
      chatRoom.owner != login
    )
      throw new UnauthorizedException('not admin');
    const mutedUntil = await this.muteService.getUserMute(muted, roomId);
    if (mutedUntil < Date.now()) {
      await this.muteService.muteUser(muted, roomId, minutes);
      return;
    } else throw new BadRequestException('already muted');
  }

  async muteUpgraded(
    login: string,
    roomId: string,
    muted: string,
    minutes: number,
  ): Promise<any> {
    const chatRoom: ChatRoom = await this.chatRoomRepo.findOne({
      where: {
        cid: roomId,
      },
      relations: ['admins', 'members'],
    });

    if (!chatRoom) throw new BadRequestException();

    if (
      !chatRoom.admins.find((u) => u.login == login) &&
      chatRoom.owner != login
    )
      throw new UnauthorizedException('not admin');

    const mmbrs = await this.muteRepo.find({
      where: {
        login: muted,
        roomId: roomId,
      },
    });

    if (mmbrs.length) {
      throw new HttpException('user already muted', HttpStatus.NOT_MODIFIED);
    }

    const mutedMember = this.muteRepo.create({
      login: muted,
      roomId: roomId,
      mutedUntil: Number(minutes),
    });
    this.muteRepo.save(mutedMember);

    (async () => {
      await new Promise((resolve) =>
        setTimeout(resolve, Number(minutes) * 60000),
      );
      if (
        await this.muteRepo.find({
          where: {
            login: muted,
            roomId: roomId,
          },
        })
      ) {
        this.muteRepo.delete({
          login: muted,
          roomId: roomId,
        });
      }
    })();
    return await this.muteRepo.find();
  }

  async unmute(login: string, roomId: string, muted: string): Promise<any> {
    if (
      await this.muteRepo.find({
        where: {
          login: muted,
          roomId: roomId,
        },
      })
    ) {
      await this.muteRepo.delete({
        login: muted,
        roomId: roomId,
      });
    }
  }

  async getMutedUsers(roomCid: string) {
    const mutedUsers = this.muteRepo.find({
      where: {
        roomId: roomCid,
      },
    });
    return mutedUsers;
  }
  async getBannedUsers(roomCid: string) {
    const bannedUsers = await this.chatRoomRepo.findOne({
      where: {
        cid: roomCid,
      },
      relations: ['banned'],
    });
    return bannedUsers.banned;
  }
  async create(createChatDto: ChatMessageDto): Promise<ChatMessage> {
    return await this.chatMessageRepo.save(
      this.chatMessageRepo.create(createChatDto),
    );
  }

  async createRoom(RoomDto: RoomDto): Promise<RoomDto> {
    if (RoomDto.type === 'protected' && !RoomDto.password)
      throw new ForbiddenException();
    else if (RoomDto.type === 'protected' && RoomDto.password)
      RoomDto.password = await bcrypt.hash(RoomDto.password, 10);
    if (RoomDto.name === null) RoomDto.name = Math.random().toString(36);
    try {
      const r = await this.chatRoomRepo.save(RoomDto);
      return r;
    } catch (e) {
    }
  }

  async findAll(): Promise<ChatMessage[]> {
    return await this.chatMessageRepo.find({ relations: ['ownerId'] });
  }

  async findAllRooms(login: string) {
    const chatRooms: ChatRoom[] = await this.chatRoomRepo.find({
      where: [
        {
          type: 'public',
        },
        {
          type: 'protected',
        },
        {
          type: 'privategroup',
        },
      ],
      relations: ['members', 'admins', 'banned'],
    });
    const result = [];
    chatRooms.map((chatroom) => {
      if (chatroom.name == 'public') return;
      if (chatroom.banned.find((u) => u.login == login)) return;
      result.push(chatroom);
    });
    return await Promise.all(
      result.map(async (chatRoom) => {
        return {
          cid: chatRoom.cid,
          name: chatRoom.name,
          owner: chatRoom.owner,
          admins: chatRoom.admins,
          members: chatRoom.members,
          banned: chatRoom.banned,
          description: chatRoom.description,
          type: chatRoom.type,
        };
      }),
    );
  }

  async findAllMessages(login: string, roomName: string) {    
    const users = await this.userRepo.find();
    const chatRoom: ChatRoom = await this.chatRoomRepo.findOne({
      where: [
        {
          name: roomName,
        },
      ],
      relations: ['messages', 'banned', 'members'],
    });
    
    if (
      chatRoom?.banned &&
      chatRoom?.banned?.find((banUser) => {
        return banUser.login === login;
      })
    )
      throw new UnauthorizedException(" User is Banned can't see messages ");
    const messages: message[] = chatRoom?.messages.map((message) => {
      return {
        text: message.text,
        date: message.createdAt,
        username: message.username,
        ownerId: message.ownerId,
        nickName: users.find((mem) => mem.displayname == message.username)?.nickName,

      };
    });
    return messages;
  }

  async findLastMessage(login: string, roomName: string) {
    let messages: message[] = [];
    let last_message = '';
    this.findAllMessages(login, roomName).then((res: message[]) => {
      messages = res;
    });
    if (messages.length) last_message = messages[messages.length - 1].text;
    return last_message;
  }

  async findRoomByName(name: string): Promise<any> {
    return await this.chatRoomRepo.findOne({
      where: { name: name },
      relations: ['members'],
    });
  }

  async findRoomById(cid: string): Promise<any> {
    return await this.chatRoomRepo.findOne({
      where: { cid },
      relations: ['members'],
    });
  }

  async remove(id: string): Promise<ChatMessage> {
    const chatMessage: ChatMessage = await this.chatMessageRepo.findOne({
      where: { messageId: id },
    });
    return this.chatMessageRepo.remove(chatMessage);
  }

  async findOne(login: string, roomId: string) {
    try {
      const chat = await this.chatRoomRepo.findOneOrFail({
        where: { cid: roomId },
        relations: ['messages', 'admins', 'banned', 'members'],
      });
      if (
        !chat.members.find((u) => u.login == login) ||
        chat.banned.find((u) => u.login == login)
      )
        throw new UnauthorizedException();
      return {
        ...chat,
        name: chat.name,
        owner: chat.owner,
        mutedUntil: await this.muteService.getUserMute(login, roomId),
        messages: chat.messages,
      };
    } catch (e) {
      throw new NotFoundException('room not found');
    }
  }

  async searchByname(name: string): Promise<ChatRoom[]> {
    const chatrooms: ChatRoom[] = await this.chatRoomRepo
      .createQueryBuilder('chatroom')
      .where('chatroom.name LIKE :s', { s: `%${name}%` })
      .getMany();
    return chatrooms.filter((c) => c.type === 'public');
  }

  async findRoomMembers(name: string) {
    const chatroom = await this.chatRoomRepo.findOne({
      where: { name: name },
      relations: ['members'],
    });
    if (!chatroom)
      throw new HttpException('room not found', HttpStatus.NOT_FOUND);
    // if (chatroom.members)
    return chatroom.members;
  }

  async getRoomCidByName(name: string): Promise<string> {
    let r = await this.searchByname(name);
    return r[0].cid;
  }

  async setAdmin(
    login: string,
    roomId: string,
    newadmin: string,
  ): Promise<any> {
    const chatRoom: ChatRoom = await this.chatRoomRepo.findOne({
      where: {
        cid: roomId,
      },
      relations: ['admins', 'members'],
    });
    if (!chatRoom) throw new UnauthorizedException();
    if (
      chatRoom.admins.find((admin) => {
        return admin.login === newadmin;
      })
    )
      return new Error(' User is Already an Admin');
    if (
      chatRoom.owner != newadmin ||
      chatRoom.admins.find((admin) => {
        return admin.login != newadmin;
      })
    ) {
      await this.chatRoomRepo.save({
        ...chatRoom,
        admins: [
          ...chatRoom.admins,
          await this.userRepo.findOne({ where: { login: newadmin } }),
        ],
      });
    } else return new UnauthorizedException();
  }

  async isAdmin(cid: string, uid: string) {
    const chatRoom: ChatRoom = await this.chatRoomRepo.findOne({
      where: {
        cid: cid,
      },
      relations: ['admins', 'members'],
    });
    if (chatRoom.admins.find((adm) =>   adm.login == uid))
      return true;
    else return false;
  }

  async removeAdmin(
    login: string,
    roomId: string,
    deletedAdmin: string,
  ): Promise<any> {
    const chatRoom: ChatRoom = await this.chatRoomRepo.findOne({
      where: {
        cid: roomId,
      },
      relations: ['admins', 'members'],
    });
    if (!chatRoom) throw new UnauthorizedException();
    if (
      chatRoom.owner === login ||
      chatRoom.admins.find((admin) => {
        return admin.login === login;
      })
    ) {
      await this.chatRoomRepo.save({
        ...chatRoom,
        admins: [...chatRoom.admins.filter((ad) => ad.table_id != Number(deletedAdmin))],
      });
    } else return new UnauthorizedException();
  }

  async updateRoomPass(
    login: string,
    data: { cid: string; oldPass: string; newPass: string },
  ) {
    const chatRoom: ChatRoom = await this.chatRoomRepo.findOne({
      where: {
        cid: data.cid,
      },
      relations: ['admins'],
    });
    if (!chatRoom) throw new UnauthorizedException();
    if (
      chatRoom.owner == login ||
      chatRoom.admins.find((ad) => ad.login == login)
    ) {
      const roomPass = await bcrypt.hash(data.newPass, 10);
      if (chatRoom.type == 'public') {
        // create new password
        await this.chatRoomRepo.save({
          ...chatRoom,
          password: roomPass,
          type: 'protected',
        });
      } else if (chatRoom.type == 'privategroup')
        throw new ForbiddenException("can't update private room");
      else {
        // if old pass is valid update
        if (await bcrypt.compare(data.oldPass, chatRoom.password)) {
          await this.chatRoomRepo.save({
            ...chatRoom,
            password: roomPass,
          });
        } else throw new ForbiddenException('wrong password');
      }
    } else throw new ForbiddenException('you are not admin');
  }

  async deleteRoomPass(login: string, roomId: string, oldPass: string) {
    const chatRoom: ChatRoom = await this.chatRoomRepo.findOne({
      where: {
        cid: roomId,
      },
      relations: ['admins'],
    });
    if (!chatRoom) throw new UnauthorizedException();
    if (
      chatRoom.owner == login ||
      chatRoom.admins.find((ad) => ad.login == login)
    ) {
      if (chatRoom.type != 'protected')
        throw new ForbiddenException('not a protected room');
      const isMatch = await bcrypt.compare(oldPass, chatRoom.password);
      if (!isMatch) throw new ForbiddenException('Wrong Password!');
      await this.chatRoomRepo.save({
        ...chatRoom,
        password: null,
        type: 'public',
      });
    }
    throw new ForbiddenException('you are not admin');
  }

  async changeRoomState(login:string, initState:string, finalState:string, password:string, cid:string) {
    const chatRoom: ChatRoom = await this.chatRoomRepo.findOne({
      where: {
        cid: cid,
      },
      relations: ['admins'],
    }); 
    if (!chatRoom) throw new ForbiddenException("wrong room cid");
    if (chatRoom.owner != login) throw new ForbiddenException("user isn't owner of the room");

    if (initState == 'protected' && finalState == 'public')
    {
      await this.chatRoomRepo.save({
        ...chatRoom,
        password: null,
        type: 'public',
      }); 
    }
    else if (initState == 'protected' && finalState == 'private')
    {
      await this.chatRoomRepo.save({
        ...chatRoom,
        password: null,
        type: 'private',
      }); 
    }
    else if (initState == 'protected' && finalState == 'protected')
    {
      await this.chatRoomRepo.save({
        ...chatRoom,
        password: await bcrypt.hash(password, 10),
      }); 
    }
    else if (initState == 'public' && finalState == 'protected')
    {
      await this.chatRoomRepo.save({
        ...chatRoom,
        password: await bcrypt.hash(password, 10),
        type: 'protected',
      }); 
    }
    else if (initState == 'public' && finalState == 'private')
    {
      await this.chatRoomRepo.save({
        ...chatRoom,
        type: 'private',
      });  
    }
    else if (initState == 'private' && finalState == 'public')
    {
      await this.chatRoomRepo.save({
        ...chatRoom,
        type: 'public',
      }); 
    }
    else if (initState == 'private' && finalState == 'protected')
    {
      await this.chatRoomRepo.save({
        ...chatRoom,
        password: await bcrypt.hash(password, 10),
        type: 'protected',
      });  
    }

 
  }
}
