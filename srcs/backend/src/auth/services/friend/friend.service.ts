import { Friend } from "src/typeOrm/entities/FriendRequest";
import { User } from "src/typeOrm";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { findFriendDTO, FriendDTO, friendStatusBlockDTO, friendStatusDTO } from "src/auth/dto/firiend.dto";
import { createBrotliCompress } from "zlib";

@Injectable()
export class FriendServices {
    constructor(
        @InjectRepository(User)
        private readonly userRepo : Repository<User>,
       @InjectRepository(Friend)
        private readonly friendRepo : Repository<Friend>,
    ){}

     async sendRequest(id: number,  creator: string, receiver: string) 
    {
        const friendUpdate: Friend =  new Friend();
        const theReceiver:User = await this.userRepo.findOneBy({login: receiver});
        const theCreator: User = await this.userRepo.findOneBy({login: creator});

        if ( theReceiver.login === creator )
            throw new ForbiddenException();
        else if (!theReceiver)
            throw new Error("There is no Player with this name!!!");

        const tableExists = (
            await this.friendRepo.manager.query(
                `SELECT exists (
                    SELECT FROM information_schema.tables
                    WHERE  table_schema = 'public'
                    AND    table_name   = 'friend'
                )`,
            )
        )[0].exists
        if (tableExists)
        {
            const checkFriendRepo: Friend = await this.friendRepo.findOne({
                where:[{
                        creator: theCreator,
                        receiver: theReceiver,
                    },
                    {
                        creator: theReceiver,
                        receiver: theCreator,
                    }],
                relations: ['creator', 'receiver']
            })
            if (checkFriendRepo)
            {
                if (checkFriendRepo.status === 'default' || checkFriendRepo.status === 'declined')
                {
                    checkFriendRepo.status = 'pending';
                    await this.friendRepo.save(checkFriendRepo);
                }
                return (checkFriendRepo);
            }
        }
        friendUpdate.creator = theCreator;
        friendUpdate.receiver = theReceiver;
        friendUpdate.status = "pending";
        const friendCreation =  this.friendRepo.create(friendUpdate);
        const save = this.friendRepo.save(friendCreation);
       return (save);
    }

    async updateFriendStatus(user:User, payload: friendStatusDTO) : Promise<Friend>
    {
        let crea = await this.userRepo.findOneBy({login: payload.sender})
        if(!crea)
            crea = await this.userRepo.findOneBy({nickName: payload.sender});
        const theLogin:Friend[] = await this.friendRepo.find({
            where: {
                status: "pending"
            },
            relations: ['creator', 'receiver'],
        });
        for (let i = 0; i < theLogin.length; i++)
        {
            if (theLogin[i].creator.login === crea.login && theLogin[i].receiver.login === user.login ||
                theLogin[i].creator.login === user.login && theLogin[i].receiver.login === crea.login )
                {
                    if (user.login === theLogin[i].receiver.login)
                    {
                        theLogin[i].status = "accepted";
                        return await this.friendRepo.save(theLogin[i]);
                    }
                }
        }
       
    }

    async friendRequest(user: User)
    {
        const allRequest:Friend  = await this.friendRepo.findOne({
            where:{
                status: "pending"
            },
            relations: ['creator', 'receiver']
        })
        if (!allRequest)
            throw new ForbiddenException("There is No Request!");
        if(allRequest.receiver.login === user.login)
            return allRequest.creator
    }

    async friendRequestStatus (user: User, payload :FriendDTO )
    {
        const theReceiver :  User = await this.userRepo.findOneBy({login: payload.receiver});
        if (!theReceiver)
        {
            throw new ForbiddenException("No Such Reciver!!!");
        }
         const tableExists = (
            await this.friendRepo.manager.query(
                `SELECT exists (
                    SELECT FROM information_schema.tables
                    WHERE  table_schema = 'public'
                    AND    table_name   = 'friend'
                )`,
            )
        )[0].exists
        if (tableExists)
        {
        const allRequest:Friend[]  = await this.friendRepo.find({
            where : [{status: 'accepted'},{status: 'blocked'}],
            relations: ['creator', 'receiver']
        })
            for (let i = 0; i < allRequest.length; i++)
            {
                if (allRequest[i].creator.login === user.login && allRequest[i].receiver.login === theReceiver.login
                    || allRequest[i].receiver.login === user.login && allRequest[i].creator.login === theReceiver.login)
                    var request: Friend = allRequest[i];
            }
            return request;
        }
        else
            throw new ForbiddenException("No Such Recive!!!");
    }


    async checkBlock (user: User, payload :FriendDTO )
    {
        const theReceiver :  User = await this.userRepo.findOneBy({login: payload.receiver});
        if (!theReceiver)
        {
            throw new ForbiddenException("No Such Reciver!!!");
        }
         const tableExists = (
            await this.friendRepo.manager.query(
                `SELECT exists (
                    SELECT FROM information_schema.tables
                    WHERE  table_schema = 'public'
                    AND    table_name   = 'friend'
                )`,
            )
        )[0].exists
        if (tableExists)
        {
        const allRequest:Friend[]  = await this.friendRepo.find({
            where : {status: 'blocked'},
            relations: ['creator', 'receiver']
        })
            for (let i = 0; i < allRequest.length; i++)
            {
                if (allRequest[i].creator.login === user.login && allRequest[i].receiver.login === theReceiver.login
                    || allRequest[i].receiver.login === user.login && allRequest[i].creator.login === theReceiver.login)
                    var request: Friend = allRequest[i];
            }
            return request;
        }
        else
            return(undefined);
    }

    async requestDeclined(user: User, payload: friendStatusDTO)
    {
        const theCreator:User = await this.userRepo.findOneBy({login:payload.sender});
        const theReceiver:Friend[] = await this.friendRepo.find({
            where: {
                status: 'pending'
            },
            relations: ['creator', 'receiver']
        })
        for (let i= 0; i < theReceiver.length; i++)
        {
            if (theReceiver[i].receiver.login === user.login && theReceiver[i].creator.login === theCreator.login)
                await this.friendRepo.remove(theReceiver[i]);
        }
    }

    async myFriends(user:User)
    {
        const allRequest: Friend[] = await this.friendRepo.find({
            where:{status: 'accepted'} 
            ,
            relations: ['creator', 'receiver']
        })
        var requestFriend = [];
        for (let i = 0; i < allRequest.length; i++)
        {
            if (allRequest[i].creator.login === user.login
                || allRequest[i].receiver.login === user.login)
            {
                        // request[i] = new Friend;
                 requestFriend.push(allRequest[i]);
            }
        }
        return requestFriend;
    }

    async blockFriend(user: User, payload:friendStatusBlockDTO)
    {
        const toBlock: User = await this.userRepo.findOneBy({login: payload.toBlock});

         const tableExists = (
            await this.friendRepo.manager.query(
                `SELECT exists (
                    SELECT FROM information_schema.tables
                    WHERE  table_schema = 'public'
                    AND    table_name   = 'friend'
                )`,
            )
        )[0].exists
        if (!tableExists)
        {
            const friendBlocked: Friend = new Friend();
            friendBlocked.block = payload.block;
            friendBlocked.blockedBy = payload.blockedBy;
            friendBlocked.creator = user;
            friendBlocked.receiver = toBlock;
            friendBlocked.status = 'blocked';
            return (await this.friendRepo.save(friendBlocked));
        }
        const request:Friend[]  = await this.friendRepo.find({
            where:{status: 'accepted'} ,
            relations: ['creator', 'receiver']
        })
        for (let i = 0; i < request.length; i++)
        {
            if (toBlock.login === request[i].receiver.login  && user.login === request[i].creator.login ||
                toBlock.login === request[i].creator.login && user.login === request[i].receiver.login)
            {
                request[i].block = true;
                request[i].blockedBy = user.login;
                request[i].status = 'blocked';
                return( await this.friendRepo.save(request));
            }
        }
            return (await this.friendRepo.save({
                creator: user,
                receiver: toBlock,
                toBlock: toBlock,
                block: true,
                blockedBy: user.login,
                status: 'blocked'
            }));
    } 

    async unblockFriend(user: User, payload: friendStatusBlockDTO)
    {
        const toBlock: User = await this.userRepo.findOneBy({login: payload.toBlock});
        const request:Friend[]  = await this.friendRepo.find({
            where:
               {
                    status : 'blocked',
               }
            ,
            relations: ['creator', 'receiver']
        })
        if (!request)
        {
            throw new ForbiddenException("Something Went Wrong!!!");
        }
      
        for (let i =0 ; i  < request.length; i++)
        {
            if (request[i].creator.login === user.login && request[i].receiver.login === toBlock.login ||
                request[i].creator.login === toBlock.login && request[i].receiver.login === user.login)
                {
                    await this.friendRepo.remove(request[i]);

                }
        }
        // return();
    }
    
    

    async   blockedBy(user:User)
    {
        const isBlocked: Friend[] = await this.friendRepo.find({
            where:
               {status: 'blocked'}
            ,
            relations: ['creator', 'receiver']
        })
        let blockedBy: User[] = [];
        for (let i = 0; i < isBlocked.length; i++)
        {
            console.log("Enter " + " Cl", isBlocked[i].creator.login, " RB", isBlocked[i].receiver.login, " US", user)
            if (isBlocked[i].creator.login === user.login || isBlocked[i].receiver.login === user.login)
            {
                for (let i= 0; i < isBlocked.length ; i++)
                {
                    if (isBlocked[i]?.creator.login !== user.login)
                        blockedBy.push(isBlocked[i].creator);
                    else if (isBlocked[i]?.receiver.login !== user.login)
                        blockedBy.push(isBlocked[i].receiver); 
                }
            }
          
        }
      
        return (blockedBy); 
    }
    async byBlock(user:User, payload: findFriendDTO)
    {
        let toFind:User = await this.userRepo.findOneBy({login: payload.user});
        if (!toFind)
        {
            toFind = await this.userRepo.findOneBy({login: payload.user})
            if(!toFind)
                throw new ForbiddenException("-----NO user with This Name!!!");
        }
        if (this.friendRepo)
        {
            const blockBy:Friend[] = await this.friendRepo.find({
                where: 
                    {
                        status: 'blocked'
                    }
                ,
                relations: ['creator', 'receiver']
            })
            for (let i = 0; i < blockBy.length; i++)
            {
                if (blockBy[i].creator.login === user.login && blockBy[i].receiver.login === toFind.login ||
                    blockBy[i].creator.login === toFind.login && blockBy[i].receiver.login === user.login)
                    return blockBy[i]
            }
        }
        return ('');
    }
    async   blockedByWho(user:User)
    {
        interface BlockedByWhom {
            blockedUsers: User[];
            blockerLogin: string;
        }
        const isBlocked: Friend[] = await this.friendRepo.find({
            where:
              {
                status: 'blocked',
              }
            ,
            relations: ['creator', 'receiver']
        })
        let blockedBy = [];
        for (let i = 0; i < isBlocked.length; i++)
        {
            if (isBlocked[i].creator.login === user.login || isBlocked[i].creator.login === user.login)
            {
                for (let i= 0; i < isBlocked.length ; i++)
                {
                    if (isBlocked[i]?.creator.login !== user.login)
                    blockedBy.push({
                            blockedUser: isBlocked[i].creator,
                            blockerLogin: isBlocked[i].blockedBy
                        });
                        else if (isBlocked[i]?.receiver.login !== user.login)
                        blockedBy.push({
                            blockedUser: isBlocked[i].receiver,
                            blockerLogin: isBlocked[i].blockedBy
                        }); 
                    }
            }
         
        }
      
        return (blockedBy); 
    }
}