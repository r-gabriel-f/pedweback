import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QR } from '../qrs/qr.entity';
import { User } from '../users/user.entity';

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'qr_id', type: 'integer', nullable: false })
  qr_id: number;

  @ManyToOne(() => QR, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'qr_id' })
  qr: QR;

  @Column({ name: 'user_id', type: 'integer', nullable: false })
  user_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  specie: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  breed: string;

  @Column({ type: 'integer', nullable: true })
  age: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  sex: string;

  @Column({ type: 'date', nullable: true })
  birthdate: Date;

  @Column({ type: 'text', nullable: true })
  characteristics: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  status: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  health_status: string;

  @Column({ type: 'text', nullable: true })
  health_vaccinations: string;

  @Column({ type: 'date', nullable: true })
  health_lastVetVisit: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  enviroment_type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  enviroment_setting: string;

  @Column({ type: 'text', nullable: true })
  enviroment_otherPets: string;

  @Column({ type: 'boolean', nullable: true })
  enviroment_hasYard: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
