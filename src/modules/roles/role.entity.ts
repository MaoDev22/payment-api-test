import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany } from 'typeorm';
import { AssignedRole } from '@app/modules/roles/assigned-role.entity';

@Entity()
@Unique(['name'])
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => AssignedRole, assignedRole => assignedRole.role)
  assignedRoles: AssignedRole[];
}
