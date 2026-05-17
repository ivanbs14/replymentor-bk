import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      service: 'replymentor-backend',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
