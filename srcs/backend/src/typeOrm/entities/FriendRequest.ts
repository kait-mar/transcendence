import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity({name: 'friend'})
export class Friend {
  @PrimaryGeneratedColumn()
  table_id: string;
    
  @Column({type: String})
  @ManyToOne(() => User, (user) => user.sender, {
    cascade: true,
  })
  creator: User;

  @Column({type:String})
  @ManyToOne(() => User, (user) => user.received, {
    cascade: true,
  })
  receiver: User;

  @Column({default: 'default'})
  status: friendStatus;

  @Column({default: false})
  block: boolean;

  @Column({nullable: true})
  blockedBy: string;
}

export type friendStatus = "pending" | "accepted" | "declined" | "blocked" | 'default';
