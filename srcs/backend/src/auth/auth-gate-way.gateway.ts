import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import {AuthService} from "../auth/services/auth/auth.service"
import {FriendServices} from "../auth/services/friend/friend.service"
import {  Server, Socket } from 'socket.io';
import { User } from 'src/typeOrm';
import { friendStatusBlockDTO } from './dto/firiend.dto';

@WebSocketGateway({namespace: '/auth', cors: true})
export class AuthGateWayGateway {
  constructor(
    private readonly FriendServices:FriendServices, 
    )
    {}
    @WebSocketServer() public server: Server
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    this.server.emit("onMessage", "mok")
    return 'Hello world!';
  }
  @SubscribeMessage('_disconnect')
	disconnection (client: Socket) {
		client.disconnect();
	}
  @SubscribeMessage('block')
  block(client: any, payload: any){
    this.server.emit(`userBlocked`, payload);
    // this.server.broadcast.emit(`userBlocked`, payload);
  } 
  
  @SubscribeMessage('unblock')
  unblock(client: any, payload: any){
    this.server.emit(`userUnBlocked`, payload);
  } 

}


// .sort((message:any, message2:any) => {
  //   return message.createdAt - message2.createdAt;
  // })