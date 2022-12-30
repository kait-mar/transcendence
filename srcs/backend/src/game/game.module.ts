import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Friend, User } from 'src/typeOrm';
// import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  imports:[ConfigModule.forRoot({envFilePath: '.env.devlopement'}),
    TypeOrmModule.forFeature([User, Friend]), AuthModule],
  providers: [GameGateway , GameService]
})
export class GameModule {}
