
import { Controller, Get, UseGuards, Redirect, Req, Res, Next, Post, Inject, HttpCode, Body, UnauthorizedException, ForbiddenException, PayloadTooLargeException} from '@nestjs/common';
import { Response, Request } from 'express';
import { from, Observable } from 'rxjs';
import { AuthGateWayGateway } from 'src/auth/auth-gate-way.gateway';
import { findFriendDTO, FriendDTO, friendStatusBlockDTO, friendStatusDTO } from 'src/auth/dto/firiend.dto';
import { AuthenticatedGuard, IntraAuthGuard } from 'src/auth/guards';
import { FriendServices } from 'src/auth/services/friend/friend.service';
import { User } from 'src/typeOrm';
import { Friend } from 'src/typeOrm/entities/FriendRequest';
import RequestWithUser from 'src/utils/types';
import { json } from 'stream/consumers';
// import {AuthGateWayGateway} from "../../auth-gate-way.gateway"



@Controller("friend")
export class FriendController {

    constructor(
        private readonly friendServices: FriendServices,
        private readonly authgateway:AuthGateWayGateway
    ){}

    @Post('sendRequest')
    @UseGuards(AuthenticatedGuard)
    async sendRequest(@Req() req: RequestWithUser, @Body() payload: FriendDTO,@Res() res) {
        if (payload.creator !== req.user.login)
            throw new ForbiddenException("You can't add Yourself");
        if (!payload.receiver)
            throw new ForbiddenException("Need a name!!");
        let receiver : string = payload.receiver;
        const theTable =  this.friendServices.sendRequest(req.user.table_id, payload.creator, receiver);
        if (theTable)
            res.send(theTable);
    }
    
    @Get("friendRequest")
    @UseGuards(AuthenticatedGuard)
    async friendRequest(@Req() req: RequestWithUser, @Res() res)
    {
       const allR :User =  await this.friendServices.friendRequest(req.user);
       if (!allR)
        throw new ForbiddenException("There is no Request");
       else
            res.send(allR.login);
    }

    @Post("requestStatus")
    @UseGuards(AuthenticatedGuard)
    async friendStatus(@Req() req: RequestWithUser,@Body() payload: FriendDTO, @Res() res): Promise<Friend | undefined>
    {
        const status:Friend = await this.friendServices.friendRequestStatus(req.user, payload);
        res.send(status);
        return status;
    }

    @Post("checkBlock")
    @UseGuards(AuthenticatedGuard)
    async checkBlock(@Req() req: RequestWithUser,@Body() payload: FriendDTO, @Res() res): Promise<Friend | undefined>
    {
        const status:Friend = await this.friendServices.checkBlock(req.user, payload);
        res.send(status);
        return status;
    }

    @Post("friendResponse")
    @UseGuards(AuthenticatedGuard)
    async requestStatus(@Req() req: RequestWithUser, @Body() payload: friendStatusDTO, @Res() res)
    {
        const reqStatus  = await this.friendServices.updateFriendStatus(req.user, payload);
        if (!reqStatus)
            throw new ForbiddenException("Something went Wrong and I dont know what is it!!!");
        else
            return res.send(reqStatus);
    }

    @Get("myFriends")
    @UseGuards(AuthenticatedGuard)
    async myFriend(@Req() req: RequestWithUser, @Res() res): Promise<Friend[] | undefined>
    {
        const myFriend: Friend[]  = await this.friendServices.myFriends(req.user);
        if (myFriend === undefined)
            throw new ForbiddenException("NO FRIEND :(");
        res.send(myFriend);
        return myFriend;
    }

    @Post("declined")
    @UseGuards(AuthenticatedGuard)
    async declineRequest(@Req() req:RequestWithUser, @Body() payload: friendStatusDTO, @Res() res)
    {
        await this.friendServices.requestDeclined(req.user, payload);
        res.send("Friend Request Removed");
    }

    @Post("block")
    @UseGuards(AuthenticatedGuard)
    async blockFriend(@Req() req: RequestWithUser, @Body() payload: friendStatusBlockDTO, @Res() res)
    {
        res.send (await this.friendServices.blockFriend(req.user, payload));
    }
    
    @Post("unblock")
    @UseGuards(AuthenticatedGuard)
    async unblockFriend(@Req() req: RequestWithUser, @Body() payload: friendStatusBlockDTO, @Res() res) 
    {
       this.authgateway.server.emit("OnMessage", "test");
       res.send (await this.friendServices.unblockFriend(req.user, payload));
        // return (await this.friendServices.unblockFriend(req.user, payload));
    }
 
    @Get("BlockedBy")
    @UseGuards(AuthenticatedGuard)
    async blockedBy(@Req() req: RequestWithUser ,   @Res() res) {
        res.send (await this.friendServices.blockedBy(req.user));
        // return (await this.friendServices.blockedBy(req.user));
    }

    @Post("byBlock")
    @UseGuards(AuthenticatedGuard)
    async byBlock(@Req() req: RequestWithUser, @Body() payload: findFriendDTO,  @Res() res){
        res.send (await this.friendServices.byBlock(req.user, payload));
    }

    @Get("BlockedByWho")
    @UseGuards(AuthenticatedGuard)
    async blockedByWho(@Req() req: RequestWithUser) {
        return (await this.friendServices.blockedByWho(req.user));
    }

}
