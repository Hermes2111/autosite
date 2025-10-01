import { Module } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get()
  test() {
    return { message: 'Test endpoint works' };
  }
}

@Module({
  controllers: [TestController],
})
export class TestModule {}

