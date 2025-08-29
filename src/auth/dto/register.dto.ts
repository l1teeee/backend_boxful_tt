import { IsEmail, IsNotEmpty, IsString, MinLength, IsDateString, Matches } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    apellido: string;

    @IsString()
    @IsNotEmpty()
    sexo: string;

    @IsDateString()
    fechaNacimiento: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^\+(503|502|504)\s7\d{3}\s\d{4}$/, {
        message: 'Número de teléfono debe tener un formato válido: +503 7458 9658'
    })
    telefono: string;


    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;

    @IsString()
    @IsNotEmpty()
    confirmPassword: string;
}