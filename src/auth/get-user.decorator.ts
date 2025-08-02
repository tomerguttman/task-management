import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser: any = createParamDecorator(
  (data: any, ctx: ExecutionContext): Promise<void> => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
