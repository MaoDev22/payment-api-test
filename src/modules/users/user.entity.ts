import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany } from 'typeorm';
import { AssignedRole } from '@app/modules/roles/assigned-role.entity';

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @OneToMany(() => AssignedRole, assignedRole => assignedRole.user)
  assignedRoles: AssignedRole[];
}
