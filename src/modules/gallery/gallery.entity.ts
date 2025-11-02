import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pet } from '../pets/pet.entity';

@Entity('pet_gallery')
export class Gallery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'pet_id', type: 'integer', nullable: false })
  pet_id: number;

  @ManyToOne(() => Pet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'image_url', type: 'text', nullable: false })
  image_url: string;

  @CreateDateColumn({ name: 'create_at' })
  create_at: Date;
}
