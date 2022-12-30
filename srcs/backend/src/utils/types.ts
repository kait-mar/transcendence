
import { Request } from 'express'
import { User } from '../typeOrm/entities/User'


export type UserDetails = {
    id : string; 
    login: string;
    firstName: string;
    lastName: string;
    email: string;
    displayname : string;
    avatar: string;
    twoFactorAuthenticationSecret: string;
    isTwoFactoAuthenticationEnabled: boolean;
}

interface RequestWithUser extends Request {
    user : User;
}

export default RequestWithUser;