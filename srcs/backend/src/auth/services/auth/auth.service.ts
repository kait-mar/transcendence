import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend, User } from 'src/typeOrm';
import RequestWithUser, { UserDetails } from 'src/utils/types';
import { Repository } from 'typeorm';
import { AuthenticationProvider } from './auth';

@Injectable()
export class AuthService implements AuthenticationProvider {

    constructor(
    @InjectRepository(User)
    private userRepo : Repository<User>,
    @InjectRepository(Friend)
    private friendRepo: Repository<Friend>
    ){}

    async validateUser(details: UserDetails) {
        const { login } = details;
        const user = await this.userRepo.findOneBy({login});
        if (user)
            return (user);
        const newUser = await this.createUser(details);
        return (newUser);
    }
    async createUser(details: UserDetails) {
        const createUser = this.userRepo.create(details);
        return (this.userRepo.save(createUser));
    }
    
    async findUser(login: string): Promise <User>{
        const rEx = /^[0-9a-zA-Z]+$/;
		if (!rEx.test(login)) {
			throw 401;
		}
        const user:User = await this.userRepo.findOneBy({login: login});
        if(!user)
        {
            var users: User = await this.userRepo.findOneBy({nickName: login});
            return users;
        }
        return (user);
    } 

   async  setTwoFactorAuthenticationSecret (secret : string, userId: string, user: User)
    {
        const secretUpdate = await this.userRepo.findOneBy({login: user.login});
        secretUpdate.twoFactorAuthenticationSecret = secret;
        const updated = await this.userRepo.save(secretUpdate);
        return updated;
    }

    async turnOnTwoFactorAuthentication(user:User)
    {
        user.isTwoFactoAuthenticationEnabled = true;
        return (await this.userRepo.save(user)); 
    }

    async turnOffTwoFactorAuthentication(user: User) {
        user.isTwoFactoAuthenticationEnabled = false;
        await this.userRepo.save(user);
    }
    
    async retriveTheUser(user:RequestWithUser) : Promise <User>
    {
        const curentUser =  await this.userRepo.findOneBy({table_id: user.user.table_id});
       
        return curentUser;
    }
    
    async changeNickname(user: User, nickname: string): Promise<User>
    {
        const rEx = /^[0-9a-zA-Z]+$/;
		if (!rEx.test(nickname)) {
			throw 401;
		}
        const updateNickname = await this.userRepo.findOneBy({table_id: user.table_id});
        
        const updateFriendNickname = await this.friendRepo.find({
            where:
            [
                {
                    creator: user,
                },
                {
                    receiver: user
                }
            ],
            relations:['creator', 'receiver']
        })
        updateNickname.nickName = nickname;
        try {
            const newName = await this.userRepo.save(updateNickname);
            for(let i = 0; i < updateFriendNickname.length; i++)
            {
                if (updateFriendNickname[i].creator.login === newName.login)
                {
                    updateFriendNickname[i].creator = newName;
                    await this.friendRepo.save(updateFriendNickname);
                }
                else if (updateFriendNickname[i].receiver.login === newName.login)
                {
                    updateFriendNickname[i].receiver = newName;
                    await this.friendRepo.save(updateFriendNickname);
                }
            }
            return(newName);
        }
        catch (err) {
            throw 403;
        }
    }

    async changeAvatar(user: User, avatar): Promise<User>
    {
        const updateNickname = await this.userRepo.findOneBy({table_id: user.table_id});
         const updateFriendAvatar: Friend[] = await this.friendRepo.find({
            where:
            [
                {
                    creator: user,
                },
                {
                    receiver: user
                }
            ],
            relations:['creator', 'receiver']
        }) 
        updateNickname.avatar = avatar;
        const newavatar:User = await this.userRepo.save(updateNickname);
        for(let i = 0; i < updateFriendAvatar.length; i++)
            {
                if (updateFriendAvatar[i].creator.login === newavatar.login)
                {
                    updateFriendAvatar[i].creator = newavatar;
                    await this.friendRepo.save(updateFriendAvatar);
                }
                else if (updateFriendAvatar[i].receiver.login === newavatar.login)
                {
                    updateFriendAvatar[i].receiver = newavatar;
                    await this.friendRepo.save(updateFriendAvatar);
                }
            }
        return(newavatar);
    }

    async getStarted(user: User, start: boolean): Promise<User>
    {
        const updateStart = await this.userRepo.findOneBy({table_id: user.table_id});
    
        updateStart.getStarted = start;
        const newStart = await this.userRepo.save(updateStart);
        return(newStart);
    }

    async returnCurrentUser(user: User) : Promise<User>
    {
        const currentUser = await this.userRepo.findOneBy({table_id: user.table_id});
        return (currentUser);
    }
}

