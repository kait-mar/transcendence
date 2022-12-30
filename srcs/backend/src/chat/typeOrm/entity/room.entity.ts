import { ChatMessage } from './message.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../typeOrm/entities/User';
import { RoomDto, roomType } from '../../dto/room.dto';

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  cid: string;

  @Column()
  type: roomType;

  @Column()
  // @ManyToOne(() => User, (user) => user.uid) // , { onUpdate: 'CASCADE' }
  // @JoinTable()
  owner: string;

  @OneToMany(() => ChatMessage, (message) => message.roomId, {
    cascade: true,
  })
  messages: ChatMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => User)
  @JoinTable()
  members: User[];
  
  @ManyToMany(() => User)
  @JoinTable()
  admins: User[];

  @Column({ unique: true })
  name: string;
  

  @Column({ nullable: true })
  password?: string;

  // @Column( { array: true, default: [] })

  // @Column({ array: true, default: [] })
  @ManyToMany(() => User)
  @JoinTable()
  banned: User[];

  @Column({ default: 'default room description' })
  description: string;
}