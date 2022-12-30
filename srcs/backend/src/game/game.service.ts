import { Injectable, Inject, UseGuards, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthenticatedGuard } from 'src/auth/guards';
import { User } from 'src/typeOrm';
import RequestWithUser from 'src/utils/types';
import { Repository } from 'typeorm';
import { metaGame } from 'src/typeOrm/entities/User';

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(User)
        private userRepor : Repository<User>
    ){}


    async updateScore(user: User, sc: number)
    {
        user.score = user.score + sc;
        return (await this.userRepor.save(user));
    }

    async findUser(_login: string) {
        const user = await this.userRepor.findOneBy({login: _login})
        return user
    }

    async findUserByNickname(_nickname: string) {
        const user = await this.userRepor.findOneBy({nickName: _nickname})
        return user
    }

    async push_opponent(user: User, opponent: User) {
        const savedUser = await this.userRepor.findOneBy({login: user.login});
        const savedOpponent = await this.userRepor.findOneBy({login: opponent.login});
        const meta_game = new metaGame(savedOpponent.nickName, savedOpponent.level, savedOpponent.score, savedUser.victory);
        const new_opp = savedUser.opponent;
        new_opp.push(meta_game);
        user.opponent = new_opp;
        return await this.userRepor.save(user);
    }

    async updateXp(player: User) {
        player.xp = player.xp + 500;
        return await this.userRepor.save(player);
    }

    async updateLevel(player: User) {
        const user: User = await this.userRepor.findOneBy({login: player.login});
        const level = user.xp / 500;
        player.level = level;
        await this.userRepor.save(player);
    }

    async updateVictory(player: User, vict: boolean) {
        player.victory = vict;
        return await this.userRepor.save(player);
    }

}

