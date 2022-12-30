import { SubscribeMessage, WebSocketGateway, WebSocketServer,
    OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io'


@WebSocketGateway({
  namespace: '/status', cors: true
})
export class UserStatusGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  ws: Server;

  private users: Socket[] = []
  private logger: Logger = new Logger('userStatus');
  private room : string = "watchers_room"

  afterInit(server: Server) {
    this.logger.log('userStatus initialized');
  }

  async handleDisconnect(client: Socket) {
    if (!client.data.role || client.data.role != "user")
      return;
    this.users.splice(this.users.indexOf(client), 1)
    await new Promise(r => setTimeout(r, 3000)); 
    const left = this.users.find(cli => cli.data.user == client.data.user)
    if (!left)
      this.ws.to(this.room).emit('status-change', {user: client.data.user, status: "offline"})
  }

  async handleConnection(client: Socket) {
    // this.logger.log(`client connected : ${(client.id)}`);
  }

  @SubscribeMessage('_disconnect')
  disconnect_client(client: Socket) {
    client.disconnect();
  }

  @SubscribeMessage('user_connected')
  new_connection(client: Socket, data: any) {
    // console.log (`user ${data.user} status ${data.status}`)
    client.data.user = data.user;
    client.data.status = data.status;
    client.data.role = "user";
    let elem: Socket;
    if ((elem = this.users.find(e=> e.data.user === data.user))) {
      this.users.splice(this.users.indexOf(elem), 1);
    }
    this.users.push(client);
    this.ws.to(this.room).emit('status-change', {user: data.user, status: data.status})

    // console.log(this.users.map(e=> {return {user: e.data.user, status: e.data.status}}))
  }

  @SubscribeMessage('watcher_connected')
  watcher_connection(client: Socket) {
    client.join(this.room)
    client.data.role = "watcher"
    for (let elem of this.users)
      client.emit('status-change', {user: elem.data.user, status: elem.data.status})
  }
}
