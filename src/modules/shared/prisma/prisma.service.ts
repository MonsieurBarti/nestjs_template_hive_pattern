import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

// Mocking PrismaClient for the template since we don't have the generated client yet
class MockPrismaClient {
  async $connect(): Promise<void> {}
  async $disconnect(): Promise<void> {}
}

@Injectable()
export class PrismaService
  extends MockPrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  // Mock extension for .withLabel()
  withLabel(_label: string): this {
    return this; // In real app, this returns the extended client
  }
}
