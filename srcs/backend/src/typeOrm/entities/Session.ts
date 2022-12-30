import { ISession } from 'connect-typeorm'
import { Column, DeleteDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity("TypeOrmSession")
export class TypeormSession implements ISession {

    @Index()
    @Column("bigint")
    public expiredAt = Date.now();

    @PrimaryColumn("varchar", { length: 255 })
    public id: string;

    @Column("text")
    public json : string;

}