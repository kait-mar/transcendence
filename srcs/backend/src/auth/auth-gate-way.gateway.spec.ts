import { Test, TestingModule } from '@nestjs/testing';
import { AuthGateWayGateway } from './auth-gate-way.gateway';

describe('AuthGateWayGateway', () => {
  let gateway: AuthGateWayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGateWayGateway],
    }).compile();

    gateway = module.get<AuthGateWayGateway>(AuthGateWayGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
