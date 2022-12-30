import {
  WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer,
  OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WsResponse
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { Inject, Logger, Req, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import { AuthenticatedGuard, IntraAuthGuard } from 'src/auth/guards';
import RequestWithUser from 'src/utils/types';
import { watch } from 'fs';
import { AuthGuard } from '@nestjs/passport';
import Game from './game';
import { User } from 'src/typeOrm';


@WebSocketGateway({
  namespace: '/game', cors: true
})


//  !!!!!! use await !!!!!!
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly gameService: GameService,) {
    this.gamesList = [];
  }

  private gamesList: Game[];
  private logger: Logger = new Logger('gameGateway');
  afterInit(server: Server) {
    this.logger.log('Game initialized');
  }

  @WebSocketServer()
  ws: Server;

  games = [{ room: 'none', label: 'NO AVAILABLE GAMES TO WATCH' }];

  async handleDisconnect(client: Socket) {
    this.logger.log(`client [${client.data.nickname}] disconnected : ${(client.id)}`);
    if (!client.data.disc) {
      await this.deleteGame(client);
    }
    
  }


  @SubscribeMessage('_disconnect')
  disconnect_client(client: Socket) {
    client.disconnect();
  }

  async handleConnection(client: Socket) {
    
  }

  @SubscribeMessage('player_connected')
  async player_connected(client: Socket, nickname: string) {
    const user = await this.gameService.findUserByNickname(nickname);
    client.data.user = user;
    client.data.nickname = nickname;
    this.logger.log(`player [${client.data.nickname}] Connected`);
    var room: string = this.joinRoom(client);
    if (room == 'none') 
      return;
    if (this.gamesList[this.gamesList.length - 1].length() === 1) {
      client.emit('order', 'first');
      client.data.order = 'first';
    }
    else if (this.gamesList[this.gamesList.length - 1].length() === 2) {
      client.emit('order', 'second');
      client.data.order = 'second';
    }
  }


  async deleteGame(client: Socket) {
    if (!client.data.user || client.data.isWatcher === true)
      return;
    for (let game of this.gamesList) {
      if (client.data.room === game.getRoom()) {
      for (let socket of game.getPlayers()) {
        socket.data.disc = true;
      }
        if (game.length() === 2) {
          await this.updateXp(game, client);
          await this.push_opponent(game, client);
        }
        this.ws.to(game.getRoom()).emit('game_ended');
        this.gamesList.splice(this.gamesList.indexOf(game), 1)
        if (game.length() === 2) {
          let removed = this.games.filter(e => e.room == game.getRoom())[0]
          this.games.splice(this.games.indexOf(removed), 1)
        }
      }
    }
  }

  already_joined(client: Socket): boolean {
    if (!this.gamesList.length)
      return false;
    for (let game of this.gamesList) {
      if (game.getPlayers()[0].data.nickname === client.data.nickname ||
        (game.length() === 2 && game.getPlayers()[1].data.nickname === client.data.nickname)) {
        console.log('available players in games are => ' + game.getPlayers().map((user, i, arr) => {
          return user.data.nickname;
        }));
        return true;
      }
    }
    return false;
  }

  joinRoom(client: Socket/*, user: User*/): string {
    var room: string;
    if (this.already_joined(client) === true) {
      client.emit('already_on_game');
      return 'none';
    }
    if (!this.gamesList.length || this.gamesList[this.gamesList.length - 1].length() === 2) {
      let new_game = new Game();
      new_game.addPlayer(client);
      this.gamesList.push(new_game);
      room = 'room_' + this.gamesList.length;
      client.join(room);
      client.emit('joinRoom', room);
      client.data.room = room;
      this.gamesList[this.gamesList.length - 1].setRoom(room);
      client.emit('start_game', false);
      return room;
    }


    if (this.gamesList[this.gamesList.length - 1].length() === 1) {
      let current_game = this.gamesList[this.gamesList.length - 1];
      client.join(current_game.getRoom());
      client.data.room = current_game.getRoom();
      client.emit('joinRoom', current_game.getRoom());
      this.gamesList[this.gamesList.length - 1].addPlayer(client);
      this.ws.to(client.data.room).emit('start_game', true);
      this.ws.to(client.data.room).emit('co-players', this.gamesList[this.gamesList.length - 1].getPlayers().map((user, _, _arr) => {
        return user.data.nickname;
      }));
      if (this.games.length === 1 && this.games[0].room == 'none')
        this.games.pop();
      this.games.push({ room: current_game.getRoom(), label: current_game.getRoom() });
      return current_game.getRoom();
    }
  }


  joinInvitedRoom(client: Socket/*, inviter: string, inviting: string*/): string {
    var room: string;
    if (!this.gamesList.length || this.gamesList[this.gamesList.length - 1].length() === 2) { //create a new room anyways
      let new_game = new Game();
      new_game.setInvitation();
      new_game.addPlayer(client);
      this.gamesList.push(new_game);
      room = 'room_' + this.gamesList.length;
      client.join(room);
      client.emit('joinRoom', room);
      client.data.room = room;
      this.gamesList[this.gamesList.length - 1].setRoom(room);
      client.emit('start_game', true);
      return room;
    }


    if (this.gamesList[this.gamesList.length - 1].length() === 1 &&
      this.gamesList[this.gamesList.length - 1].getInvitation() == true) { 
      let current_game = this.gamesList[this.gamesList.length - 1];
      client.join(current_game.getRoom());
      client.data.room = current_game.getRoom();
      client.emit('joinRoom', current_game.getRoom());
      this.gamesList[this.gamesList.length - 1].addPlayer(client);
      this.ws.to(client.data.room).emit('start_game', true);
      if (this.games.length === 1 && this.games[0].room == 'none')
        this.games.pop();
      this.games.push({ room: current_game.getRoom(), label: current_game.getRoom() });
      return current_game.getRoom();
    }
  }



  @SubscribeMessage('player')
  handlePlayer(client: Socket, player: any): void {
    this.ws.to(client.data.room).emit('player', player);
  }

  @SubscribeMessage('opponent')
  handleOpponent(client: Socket, opponent: any): void {
    // client.emit('player', 'player event recienved to server');
    this.ws.to(client.data.room).emit('opponent', opponent);
  }

  /**
   * choose game for streaming
   * @param client
   */
  @SubscribeMessage('ShowGame') //Stream
  chooseGame(client: Socket) {
    client.emit('chooseGame', this.games);
  }

  @SubscribeMessage('watcher_connected')
  async watcher_connected(client: Socket/*, login: string*/, watcher: string) {
    this.logger.log(`watcher ${client.id} Connected to room [${watcher}]`);
    client.join(watcher);
    client.data.room = watcher
    client.data.isWatcher = true
    let players: Socket[] = this.gamesList.find(game => game.getRoom() == watcher).getPlayers()
    client.emit('watcher-co-players', players.map(elem => elem.data.nickname))
    if (players[0].data.playerScore) {
      client.emit('watcher-player-score', players[0].data.playerScore)
    }
    if (players[0].data.opponentScore) {
      client.emit('watcher-opponent-score', players[0].data.opponentScore)
    }
  }

  findUsersRoom(friend: string): string {
    return this.gamesList.find(game => game.getPlayers().find(player => player.data.nickname == friend)).getRoom()
  }

  @SubscribeMessage('friend_watcher_connected')
  async friend_watcher_connected(client: Socket, friend: string) {
    this.logger.log(`friend watcher ${client.id} Connected to watch user [${friend}]`);
    const watcher: string = this.findUsersRoom(friend)
    client.join(watcher);
    client.data.room = watcher
    client.data.isWatcher = true
    let players: Socket[] = this.gamesList.find(game => game.getRoom() == watcher).getPlayers()
    client.emit('watcher-co-players', players.map(elem => elem.data.nickname))
    if (players[0].data.playerScore) {
      client.emit('watcher-player-score', players[0].data.playerScore)
    }
    if (players[0].data.opponentScore) {
      client.emit('watcher-opponent-score', players[0].data.opponentScore)
    }
  }

  @SubscribeMessage('scoreUpdate')
  async scoreUpdate(client: Socket, score: any) {
    if ( client.data.isWatcher === true)
      return;
    if (score.left === true) {
      client.data.left = true;
      return ;
    }
    client.data.score = score.playerScore; // keep verifying this
    // this is just added | try to comment/uncomment  it and test
    for (let game of this.gamesList) {
      if (client.data.room === game.getRoom()) {
        if (client === game.getPlayers()[0]) {
          game.getPlayers()[1].data.score = score.opponentScore;
          if (game.getPlayers()[1].data.left == true)
            return ;
        }
        else {
          game.getPlayers()[0].data.score = score.opponentScore;
          if (game.getPlayers()[0].data.left == true)
            return ;
        }
      }
    }
    await this.gameService.updateScore(client.data.user, score.playerScore);
  }


  async updateXp(game: Game, player: Socket) {
    const player0: Socket = game.getPlayers()[0];
    const player1: Socket = game.getPlayers()[1];
    if (player.data.left === true) {
      if (player == player0) {
        await this.gameService.updateVictory(player0.data.user, false);
        await this.gameService.updateVictory(player1.data.user, true);
      }
      else {
        await this.gameService.updateVictory(player0.data.user, true);
        await this.gameService.updateVictory(player1.data.user, false);
      }
      return ;
    }
    if (player0.data.score > player1.data.score) {
        await this.gameService.updateXp(player0.data.user);
        await this.gameService.updateLevel(player0.data.user);
        await this.gameService.updateVictory(player0.data.user, true);
        await this.gameService.updateVictory(player1.data.user, false);
    }
    else if (player0.data.score < player1.data.score) {
        await this.gameService.updateVictory(player0.data.user, false);
        await this.gameService.updateXp(player1.data.user);
        await this.gameService.updateLevel(player1.data.user);
        await this.gameService.updateVictory(player1.data.user, true);
    }
  }

  async push_opponent(game: Game, player: Socket) {
    const player0 = game.getPlayers()[0].data.user;
    const player1 = game.getPlayers()[1].data.user;
      await this.gameService.push_opponent(player0, player1); 
   
      await this.gameService.push_opponent(player1, player0);
  }

  @SubscribeMessage('Local_playerScore')
  LocalPlayerScore(client: Socket, score: number) {
    client.data.score = score;
    client.data.playerScore = score
    this.ws.to(client.data.room).emit('player_scores', score);
  }

  @SubscribeMessage('Local_oponentScore')
  LocalOponentScore(client: Socket, score: number) {
    this.ws.to(client.data.room).emit('opponent_scores', score);
    client.data.opponentScore = score
    for (let game of this.gamesList) {
      if (client.data.room === game.getRoom()) {
        if (client === game.getPlayers()[0])
          game.getPlayers()[1].data.score = score;
        else
          game.getPlayers()[0].data.score = score;
      }
    }
  }

  @SubscribeMessage('invite_game')
  async invite_game(client: Socket, state: any) {
    var user: User;
    const { inviter, inviting, invitation_creator } = state;
    if (invitation_creator == true) {
      user = await this.gameService.findUser(inviter);
    }
    else if (invitation_creator == false) {
      user = await this.gameService.findUser(inviting);
    }
    client.data.user = user;
    client.data.nickname = user.nickName
    this.logger.log(`player [${client.data.nickname}] Connected`);
    var room: string = this.joinInvitedRoom(client);
    if (this.gamesList[this.gamesList.length - 1].length() === 1) {
      client.emit('order', 'first');
      client.data.order = 'first';
    }
    else if (this.gamesList[this.gamesList.length - 1].length() === 2) {
      client.emit('order', 'second');
      client.data.order = 'second';
    }
  }

}

