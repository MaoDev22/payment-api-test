import { Entity, PrimaryGeneratedColumn, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@app/modules/users/user.entity';
import { Role } from '@app/modules/roles/role.entity';

@Entity()
@Unique(['user', 'role'])
export class AssignedRole {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.assignedRoles, { eager: true, nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role, role => role.assignedRoles, { eager: true, nullable: false })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
