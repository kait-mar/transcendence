import { Controller, Get, UseGuards, UploadedFile, UseInterceptors, Redirect, Req, Res, Next, Post, Inject, HttpCode, Body, UnauthorizedException, Param, UseFilters} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthenticatedGuard, IntraAuthGuard } from 'src/auth/guards';
import { FileInterceptor } from "@nestjs/platform-express";
import * as fs  from "fs";
import { AuthGuard } from '@nestjs/passport';
import { request } from 'http';
import { registerAs } from '@nestjs/config';
import { TwoFactorAuthenticationService } from 'src/auth/services/auth/twoFactorAuthentication.service';
import { User } from 'src/typeOrm';
import RequestWithUser from 'src/utils/types';
import { AuthenticationProvider } from 'src/auth/services/auth/auth';
import { tfaValidation } from 'src/auth/dto/tfa.dto';
import { nickNameDTO, getStartedDTO } from 'src/auth/dto/nickName.dto';
import { idRequestDTO } from 'src/auth/dto/idRequest.dto';
import { ViewAuthFilter } from 'src/auth/strategies';

@Controller('auth')
export class AuthController {
    constructor(
        @Inject('AUTH_SERVICE')
        private readonly authService: AuthenticationProvider,
        private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    )  {} 

    @Get('login')
    @UseGuards(IntraAuthGuard)
    login(@Req() req: RequestWithUser, @Res() res) {
        return req.user;
    }

    @Get('red')
    red(@Req() request, @Res() res:Response)
    {
        res.redirect('http://' + process.env.IP_ADDRESS + ':3001/')
    }

    @Get('redirect')
    @UseGuards(IntraAuthGuard)
    @UseFilters(ViewAuthFilter)
    redirect(@Req() req,  @Res() res: Response) {
        if (req.user.isTwoFactoAuthenticationEnabled)
            res.redirect('http://' + process.env.IP_ADDRESS + ':3001/qrCode')
        else
            res.redirect('http://' + process.env.IP_ADDRESS + ':3001/connected');
    }

    @Get('status')
    @UseGuards(AuthenticatedGuard)
    status (@Req() req, @Res() res) {
        if (req.user)
           return (res.send(req.user));
        else
            return (res.send(401))
    }

    @Get('2fa')
    @UseGuards(AuthenticatedGuard)
    async register(@Res() res: Response, @Req() req :RequestWithUser)
    {
        const { otpauthUrl} = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(req.user);
        const qrCode = this.twoFactorAuthenticationService.piperQrCodeStream(res, otpauthUrl); 
       return   qrCode 
    }

    @Post('turn-on')
    @HttpCode(200)
    //@UseGuards(AuthenticatedGuard)
    async turnOnTwoFactorAuthentication(@Req() req: RequestWithUser,
        @Body() twoFactorAuthenticationCode : tfaValidation, @Res() res: Response)
    {
        const isValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode.twoFactorAuthenticationCode, req.user);
        if (!isValid)
            throw new UnauthorizedException('Wrong authentication code');
        await this.authService.turnOnTwoFactorAuthentication(req.user);
        res.send(200);
    }

    @Get('turn-off')
    async turnOffTwoFactorAuthentication(@Req() req: RequestWithUser, @Res() res: Response)
    {
        await this.authService.turnOffTwoFactorAuthentication(req.user)
        res.send(200)
    }

    @Get('logout')
    @UseGuards(AuthenticatedGuard)
    async logout(@Req() req: RequestWithUser, @Res() res,) {
        req.session.destroy(function() {
            res.clearCookie('connect.sid');
            res.redirect('http://' + process.env.IP_ADDRESS + ':3001/')
        });
    }


    @Get('logedIn')
    @UseGuards(AuthenticatedGuard)
    async loggedIn(@Req() req:Request, @Res()res){
        if (req.session.id)
            res.send({loggedOn:true, sessionId:req.session.id})
        else
            res.send({loggedOn:false})
    }

    @Post('change-nickname')
    @UseGuards( AuthenticatedGuard )
    async changeNickname(@Req() req: RequestWithUser,
        @Body() newNickname: nickNameDTO, @Res() res)
    {
        try {
            const s = await this.authService.changeNickname(req.user, newNickname.nickname)
            res.send(s);
        }
        catch (err) {
            res.sendStatus(err)
        }
    }

    @Post('change-avatar/:userImage')
    @UseInterceptors(FileInterceptor('avatar'))
    @UseGuards( AuthenticatedGuard )
    async changeAvatar(
        @Req() req: RequestWithUser,
		@Param('userImage') userImage : string,
		@UploadedFile() newAvatar: Express.Multer.File,
    ){
        let cwd = process.cwd()

        fs.writeFileSync( cwd + "/public/assets/" + userImage, newAvatar.buffer);
        // fs.writeFileSync(cwd + "/public/assets/" + userImage, newAvatar.buffer);
        return await this.authService.changeAvatar(req.user,  "http://" + process.env.IP_ADDRESS + ":3000/assets/" + userImage)
    }

    @Post('getStarted')
    @UseGuards( AuthenticatedGuard )
    async getStarted(@Req() req: RequestWithUser,
        @Body() newstart: getStartedDTO, @Res() res)
    {
        res.send( this.authService.getStarted(req.user, newstart.getStarted) );
    }

    @Post('/getId')
    @UseGuards(AuthenticatedGuard)
    async getUserId(@Body() userId:idRequestDTO, @Res() res)
    {
        const user:User = await this.authService.findUser(userId.userId)
        res.send( user );
    }

    @Get('get-user')
    @UseGuards(AuthenticatedGuard)
    async getUser(@Req() req: RequestWithUser, @Res()res) {
        const _user = req.user;
        res.send({user: _user});
    }

    @Get('user/:id')
    @UseGuards(AuthenticatedGuard)
    async checkUserInData(@Param('id') id: string, @Res() res)
    {
        const user:User = await this.authService.findUser(id)
        if (user)
            res.send( user );
        else
            throw new UnauthorizedException('Wrong authentication code');
    }
}
