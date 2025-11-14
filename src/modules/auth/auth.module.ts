import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule, // Para usar UsersService
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],             // Permite usar ConfigService dentro del factory
      inject: [ConfigService],             // Inyecta ConfigService en la función
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('jwt.secret');      // Lee el secreto validado
        const expiresIn = configService.get<number>('jwt.expiresIn'); // Lee la expiración validada

        return {
          secret,                           // Devuelve el secreto al JwtModule
          signOptions: { expiresIn },       // Configura la expiración de los tokens
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [PassportModule, JwtModule],
})
export class AuthModule { }