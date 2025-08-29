import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@ValidatorConstraint({ name: 'isEmailUnique', async: true })
@Injectable()
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {
    constructor(private readonly prisma: PrismaService) {}

    async validate(email: string, args: ValidationArguments): Promise<boolean> {
        if (!email) return true; // Si no hay email, no validar (lo manejará @IsNotEmpty)

        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { email },
                select: { id: true },
            });

            return !existingUser; // Retorna true si NO existe el usuario
        } catch (error) {
            console.error('Error validating email uniqueness:', error);
            return false; // En caso de error, asumir que no es válido
        }
    }

    defaultMessage(args: ValidationArguments): string {
        return 'El correo electrónico ya está registrado';
    }
}

@ValidatorConstraint({ name: 'isPhoneUnique', async: true })
@Injectable()
export class IsPhoneUniqueConstraint implements ValidatorConstraintInterface {
    constructor(private readonly prisma: PrismaService) {}

    async validate(phone: string, args: ValidationArguments): Promise<boolean> {
        if (!phone) return true; // Si no hay teléfono, no validar

        try {
            const existingUser = await this.prisma.user.findFirst({
                where: { telefono: phone },
                select: { id: true },
            });

            return !existingUser; // Retorna true si NO existe el usuario
        } catch (error) {
            console.error('Error validating phone uniqueness:', error);
            return false;
        }
    }

    defaultMessage(args: ValidationArguments): string {
        return 'El número de teléfono ya está registrado';
    }
}

// Decoradores para usar en los DTOs
export function IsEmailUnique(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsEmailUniqueConstraint,
        });
    };
}

export function IsPhoneUnique(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsPhoneUniqueConstraint,
        });
    };
}