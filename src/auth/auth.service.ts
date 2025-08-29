import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    async register(registerDto: RegisterDto) {
        const { password, confirmPassword, ...userData } = registerDto;

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            throw new BadRequestException('Las contraseñas no coinciden');
        }

        // Verificar si el email ya existe
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('El correo electrónico ya está registrado');
        }

        // Encriptar la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        try {
            // Crear el usuario
            const user = await this.prisma.user.create({
                data: {
                    ...userData,
                    fechaNacimiento: new Date(registerDto.fechaNacimiento),
                    password: hashedPassword,
                },
                select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    email: true,
                    sexo: true,
                    fechaNacimiento: true,
                    telefono: true,
                    createdAt: true,
                },
            });

            // REGISTRO: Solo retornar mensaje de éxito y datos del usuario, SIN TOKEN
            return {
                message: 'Usuario registrado exitosamente',
                user,
            };
        } catch (error) {
            throw new BadRequestException('Error al crear el usuario');
        }
    }

    async login(email: string, password: string) {
        // Buscar el usuario
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new BadRequestException('Credenciales inválidas');
        }

        // Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new BadRequestException('Credenciales inválidas');
        }

        // Generar JWT token SOLO en login
        const payload = {
            sub: user.id,
            email: user.email,
            nombre: user.nombre
        };
        const token = this.jwtService.sign(payload);

        // LOGIN: Retornar mensaje, datos del usuario Y TOKEN
        return {
            message: 'Inicio de sesión exitoso',
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                sexo: user.sexo,
                fechaNacimiento: user.fechaNacimiento,
                telefono: user.telefono,
            },
            token, // Token JWT solo en login
        };
    }
}