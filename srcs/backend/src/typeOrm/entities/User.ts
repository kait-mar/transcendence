import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToMany, JoinTable } from 'typeorm'
import { Friend } from './FriendRequest';

// Postgres Database implenting Users

@Entity({ name: 'users'})
export class User implements IUser{
    @PrimaryGeneratedColumn()
    table_id :number;

    @Column ( {name: 'login'})
    login: string;

    @Column( {} )
    id: string;

    @Column( { })
    displayname: string; 

    @Column({})
    firstName: string;

    @Column({})
    lastName: string;

    @Column()
    email: string;

    @Column({nullable: true})
    avatar: string

    @Column({nullable:true})
    twoFactorAuthenticationSecret: string;

    @Column({default:false})
    isTwoFactoAuthenticationEnabled: boolean;

    @OneToMany(() => Friend, (friend) => friend.creator)
//    @JoinTable()
    sender: Friend[];

    @OneToMany(() => Friend, (friend) => friend.receiver)
   // @JoinTable()
    received: Friend[];

    @Column({default:  0})
    score: number;

    @Column({nullable:true, unique: true})
    nickName: string;

    @Column({default: 0})
    xp: number

    @Column({default: 0})
    level: number

    @Column({default: false})
    victory: boolean

    // @Column("metaGame", { array: true , default: []})
    // opponent: metaGame[]

    @Column('jsonb', {default: []})
    opponent: metaGame[]

    @Column({default: true})
    getStarted: boolean
}


//Implementing interface to force User class using the right variables

export interface IUser {
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

export class metaGame {
    opponent: string;
    opponent_level: number;
    status: string;
    opponent_score: number;

    constructor(opp: string, level: number, score: number, stat: boolean) {
        this.opponent = opp;
        this.opponent_level = level;
        this.opponent_score = score;
        if (!stat)
            this.status = 'Lost';
        else
            this.status = 'Winner';
    }
}
