import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { CircularService } from './circular.service';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject(forwardRef(() => CircularService))
    private readonly circularService: CircularService
  ) {
    console.log('AuthService constructor');
    console.log('CircularService:', this.circularService);
  }

  onModuleInit() {
    console.log('AuthService init');
    console.log('CircularService:', this.circularService);
  }
}
