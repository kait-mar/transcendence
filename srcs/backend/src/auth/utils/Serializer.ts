import { Inject, Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { use } from "passport";
import { User } from '../../typeOrm';
import { AuthenticationProvider } from "../services/auth/auth";

@Injectable()
export class SessionSerializer extends PassportSerializer{

    constructor(
        @Inject('AUTH_SERVICE')
        private readonly authService: AuthenticationProvider,
    ){
        super();
    }
    serializeUser(user: User, done: (err: Error, user: User) => void) {
       done(null, user); 
    }

    async deserializeUser(user: User, done:  (err: Error, user: User) => void) {
        const userDB = await this.authService.findUser(user.login);
        if (userDB)
           return done(null, userDB); 
        return done(null, null);
    }
}