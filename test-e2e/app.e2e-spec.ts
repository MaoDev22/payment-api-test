import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from './../src/app.module';

import { User } from '@app/modules/users/user.entity';
import { Role } from '@app/modules/roles/role.entity';
import { AssignedRole } from '@app/modules/roles/assigned-role.entity';
import { Product } from '@app/modules/products/product.entity';

const mockRepository = {
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  save: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockResolvedValue({}),
};

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(getRepositoryToken(User)).useValue(mockRepository)
    .overrideProvider(getRepositoryToken(Role)).useValue(mockRepository)
    .overrideProvider(getRepositoryToken(AssignedRole)).useValue(mockRepository)
    .overrideProvider(getRepositoryToken(Product)).useValue(mockRepository)
    .overrideProvider('TypeOrmModule').useValue({}) 
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
