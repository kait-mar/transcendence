import { ChatRoom } from './room.entity';
import { User } from '../../../typeOrm/entities/User';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  messageId: string;

  @Column()
  text: string;

  @Column()
  @ManyToOne((type) => ChatRoom, (chatRoom) => chatRoom.cid, {
    onDelete: 'SET NULL',
  })
  roomId: string;

  @Column()
  @ManyToOne((type) => User, (user) => user.table_id)
  ownerId: string;

  @Column()
  username: string;

  @CreateDateColumn()
  createdAt: Date;
}
