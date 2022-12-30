

import { IsString } from "class-validator";

export class idRequestDTO {
    @IsString()
    userId: string;
}