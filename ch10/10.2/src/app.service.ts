import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';

@Injectable()
export class CompositeGuard implements CanActivate {
  constructor(
    private readonly guardA: AGuard,
    private readonly guardB: BGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const guards = [this.guardA, this.guardB];

    for (const guard of guards) {
      const result = await guard.canActivate(context);
      if (!result) return false;
    }

    return true;
  }
}
