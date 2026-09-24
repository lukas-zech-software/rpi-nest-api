import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { AppModule } from '../../src/app.module';
import { AccessTokenDto, LoginDto, UpdatePasswordDto } from '../../src/authentication/dto/login.dto';
import { TEST_DEFAULT_PASSWORD } from '../../src/shell-command/command-services/pi-serial-command.service';
import { ADMIN_USER_NAME } from '../../src/authentication/constants';

describe('AppController (integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  function request() {
    return supertest(app.getHttpServer());
  }

  async function login(testLogin: LoginDto) {
    // Get token
    const response = await request().post('/authentication/login').send(testLogin).expect(200);

    const { token } = response.body as AccessTokenDto;
    expect(typeof token).toEqual('string');
    return token;
  }

  it('should change admin password and reset it back to default', async () => {
    const defaultLogin: LoginDto = {
      username: ADMIN_USER_NAME,
      password: TEST_DEFAULT_PASSWORD,
    };

    const updateLogin: UpdatePasswordDto = {
      ...defaultLogin,
      newPassword: 'new_test_password',
    };

    const newLogin: LoginDto = {
      username: ADMIN_USER_NAME,
      password: updateLogin.newPassword,
    };

    const token = await login(defaultLogin);

    // Update admin password
    await request()
      .post('/authentication/update-password')
      .auth(token, { type: 'bearer' })
      .send(updateLogin)
      .expect(200);

    // Login with default password should fail
    await request().post('/authentication/login').send(defaultLogin).expect(401);

    // Login with new password should work
    await request().post('/authentication/login').send(newLogin).expect(200);

    // Reset admin password to default
    await request().post('/authentication/reset-admin-password').expect(200);

    // Login with new password should fail
    await request().post('/authentication/login').send(newLogin).expect(401);

    // Login with default password should work again
    await request().post('/authentication/login').send(defaultLogin).expect(200);
  });
});
