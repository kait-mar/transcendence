import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface notif{
    sender: string,
    receiver: string,
}

export interface notifSender{
    sender: string;
    accepted: boolean,
    receiver: string
}

export interface block {
    blocked: string;
    blockedBy: string;
}

@WebSocketGateway({
                cors: true})
export class Gateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {

    private users: Socket[] = []

    @WebSocketServer()
    server: Server;
   
    find_reciever (reciever: string): Socket[]  {
        let recievers: Socket[] = this.users.filter(e => e.data.login == reciever)
        return recievers
    }
    find_sender(sender: string): Socket[] {
        let recievers: Socket[] = this.users.filter(e => e.data.login == sender)
        return recievers
    }

    @SubscribeMessage('notification')
    handleEvent(@MessageBody() data: notif) {
        let recievers: Socket[] = this.find_reciever(data.receiver)
        recievers.forEach((e) => {
            e.emit('receiveNotif', data)
        })
    }

    @SubscribeMessage('gameAccepted')
    handleEvents(@MessageBody() data: notif)
    {
        const datas: notifSender = {sender: data.sender, accepted:true, receiver: data.receiver}
        let senders: Socket[] = this.find_sender(data.sender);
        senders.forEach((e) => {
            e.emit('GameAccepted', datas);
        })
    }


    @SubscribeMessage('sendRequest')
    sendFriendRequest(@MessageBody() data:notif)
    {
        const datas: notifSender = {sender: data.sender, accepted:true, receiver: data.receiver}
        let recievers: Socket[] = this.find_reciever(data.receiver)
        recievers.forEach((e) => {
            e.emit('receiveFriendRequest', datas);
        })
    }

    handleConnection(client: any, ...args: any[]) {
    }

    handleDisconnect(client: any) {
    }

    @SubscribeMessage('user_connected')
    user_connected(client: Socket, login: string) {
        client.data.login = login
        this.users.push(client)
    }

    @SubscribeMessage('_disconnect')
    user_disconnect(client: Socket)
    {
        client.disconnect();
    }

    afterInit(server: any) {
    }
}
