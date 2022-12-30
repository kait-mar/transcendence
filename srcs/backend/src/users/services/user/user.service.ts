import { Injectable } from '@nestjs/common';
import { UserDto } from 'src/users/dto/User';
import { threadId } from 'worker_threads';
import { IUserService } from './user';

@Injectable()
export class UserService implements IUserService {
    
    private users: UserDto[] = [];
    
    
    createUser(user: UserDto) {
        this.users.push(user);
    }

    getUser(): UserDto[] {
       return this.users;
    }

    deleteUser() {
        
    }

    getUserByUserName(username: string) : UserDto | undefined{
        return this.users.find((user) => user.username === username);
    }

}
