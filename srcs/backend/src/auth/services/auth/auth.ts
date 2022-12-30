
import RequestWithUser, { UserDetails } from "src/utils/types";
import { User } from "../../../typeOrm";

export interface AuthenticationProvider{
    validateUser(details: UserDetails);
    createUser(details: UserDetails);
    findUser(login: string) : Promise <User | undefined>;
    setTwoFactorAuthenticationSecret (secret : string, userId: string, user: User);
    turnOnTwoFactorAuthentication(user: User);
    retriveTheUser(user:RequestWithUser) : Promise <User>
    changeNickname(user: User, nickname: string);
    changeAvatar(user: User, avatar);
    returnCurrentUser(user: User) ;
    getStarted(user: User, start: boolean): Promise<User>
    turnOffTwoFactorAuthentication(user: User);
}
