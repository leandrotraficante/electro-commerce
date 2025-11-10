import {Request} from 'express';
import { User } from 'src/modules/users/entities/user.entity';

export interface RequestWithUser extends Request {
  user: User;
}