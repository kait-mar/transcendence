import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users/users.controller';
import { PostsController } from './controllers/posts/posts.controller';
import { UserService } from './services/user/user.service';
import { PostsService } from './services/posts/posts.service';
import { ChatService } from 'src/chat/src/chat.service';
import { ChatModule } from 'src/chat/src/chat.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeOrm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, PostsController],
  providers: [{
    provide: 'User_Service',
    useClass: UserService,
  }, PostsService],
})
export class UsersModule {}
