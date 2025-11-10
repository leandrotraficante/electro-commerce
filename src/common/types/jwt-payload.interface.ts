import { RolesEnum } from '../enums/enums';

export interface JwtPayload {
    sub: number;     // user.id
    email: string;
    role: RolesEnum;
    iat?: number;    // opcional - fecha de emisión
    exp?: number;    // opcional - fecha de expiración
  }