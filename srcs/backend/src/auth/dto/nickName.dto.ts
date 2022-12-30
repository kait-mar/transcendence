import { IsEmail, IsString, IsNotEmpty, MinLength, IsBoolean } from 'class-validator';

export class nickNameDTO {

    @IsString()
    nickname:string;
}

export class getStartedDTO {
    @IsBoolean()
    getStarted: boolean;
}