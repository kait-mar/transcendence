import { UserDto } from "src/users/dto/User";

export interface IUserService{
    getUser();
    createUser(user: UserDto);
    deleteUser();
    getUserByUserName(username: string): UserDto | undefined;
}