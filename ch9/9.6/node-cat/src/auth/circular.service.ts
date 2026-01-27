import { Injectable, OnModuleInit, Inject, forwardRef } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Injectable()
export class CircularService implements OnModuleInit {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {
    console.log('CircularService constructor');
    console.log('AuthService:', this.authService);
  }

  onModuleInit() {
    console.log('CircularService init');
    console.log('AuthService:', this.authService);
  }
}
