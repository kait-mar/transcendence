import { IsBoolean, IsString } from "class-validator";

export class FriendDTO {
    @IsString()
    creator : string;

    @IsString()
    receiver: string;
}

export class friendStatusDTO {
    
    friendStatus : friendStatus;

    @IsString()
    user: string;

    @IsString()
    sender: string;
}

export class friendStatusBlockDTO {
    

    @IsString()
    toBlock: string;

    @IsString()
    blockedBy: string;

    @IsBoolean()
    block:boolean;
}

export class findFriendDTO {

    @IsString()
    user: string;
}


export type friendStatus = "accepted" | "declined";