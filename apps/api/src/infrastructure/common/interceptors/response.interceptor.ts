import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already structured with success/meta, pass through or wrap
        if (data && typeof data === 'object' && 'success' in data && data.success === true) {
          return data;
        }
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        };
      })
    );
  }
}