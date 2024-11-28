import { Request } from 'express';
import { AuthObject } from '@clerk/backend';

export interface AuthenticatedRequest extends Request {
  auth: AuthObject;
}
