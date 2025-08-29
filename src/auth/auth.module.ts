import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'gbb1Fh3xeDDzO4kydvdYtbtPx0jtYSzA7vhCrTOyhFRrmi6t7jeFYxdhg8GlqsGo',
            signOptions: { expiresIn: '24h' },
        }),
    ],
    providers: [AuthService, PrismaService],
    controllers: [AuthController],
})
export class AuthModule {}