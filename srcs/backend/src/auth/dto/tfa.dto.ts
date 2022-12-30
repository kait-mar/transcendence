

import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class tfaValidation {

    @IsString()
    twoFactorAuthenticationCode:string;
}

