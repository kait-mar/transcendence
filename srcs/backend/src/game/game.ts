import { Socket } from "socket.io";
import { User } from "src/typeOrm";

export default class   Game {
    private players: Socket[];
    private invitation: boolean;
    private room: string;
    private inviters: string[]

    constructor() {
        this.players = [];
        this.invitation = false;
    }
    setRoom = (newRoom: string) => {
        this.room = newRoom;
    }

    addPlayer = (player: Socket) => {
        this.players.push(player);
    }

    getPlayers = (): Socket[] => {
        return this.players;
    }

    getInviters = (): string[] => {
        return this.inviters;
    }

    setInviters = (inviter: string, inviting: string) => {
        this.inviters.push(inviter);
        this.inviters.push(inviting);
    }

    setInvitation = () => {
        this.invitation = true;
    }

    getRoom = () :string => {
        return this.room;
    }

    getInvitation = () => {
         return this.invitation;
    }
    length = () : number => {
        return this.players.length;
    }
    // removePlayer = () => {

    // }
}
