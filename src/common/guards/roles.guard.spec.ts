import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
  });

  const mockExecutionContext = (roles: string[], userRoles: string[]) => {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { roles: userRoles },
        }),
      }),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should allow access if no roles are defined', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(null);
      const context = mockExecutionContext([], ['USER']);

      const result = rolesGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access if user has the required roles', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN']);
      const context = mockExecutionContext(['ADMIN'], ['ADMIN']);

      const result = rolesGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access if user does not have the required roles', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN']);
      const context = mockExecutionContext(['ADMIN'], ['USER']);

      const result = rolesGuard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should deny access if user has no roles', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['ADMIN']);
      const context = mockExecutionContext(['ADMIN'], []);

      const result = rolesGuard.canActivate(context);

      expect(result).toBe(false);
    });
  });
});
