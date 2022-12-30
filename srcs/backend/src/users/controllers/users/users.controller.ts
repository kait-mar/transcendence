import { Controller, Get, Inject, Post, Delete, Body, HttpStatus, HttpCode, Param } from '@nestjs/common';
import { ChatService } from 'src/chat/src/chat.service';
import { UserDto } from 'src/users/dto/User';
import { PostsService } from 'src/users/services/posts/posts.service';
import { IUserService } from 'src/users/services/user/user';

@Controller('users')
export class UsersController {

    constructor(@Inject('User_Service') private readonly userService: IUserService){}

    @Get()
    getUsers() {
        return this.userService.getUser();
    }

    @Post()
    @HttpCode(201)
    createUser(@Body() user: UserDto){
        return this.userService.createUser(user);
    }

    @Delete()
    deleteUser()
    {
        return this.userService.deleteUser();
    }

    @Get(':username')
    getUserByUserName(@Param('username') username:string)
    {
        const user = this.userService.getUserByUserName(username);

        return user ? user :  {}
    }
}
