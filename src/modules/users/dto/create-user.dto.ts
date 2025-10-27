import { IsEmail, IsNotEmpty, IsString, IsOptional, Length, Matches } from 'class-validator';

export class CreateUserDto {

    @IsEmail({}, { message: 'Email inválido' }) // Valida que sea un email válido
    @IsNotEmpty({ message: 'El email es obligatorio' }) // Obligatorio
    email: string;
    
    @IsString() // Debe ser string
    @IsNotEmpty({ message: 'La contraseña es obligatoria' }) // Obligatorio
    @Length(8, 50, { message: 'La contraseña debe tener entre 8 y 50 caracteres' }) // Longitud mínima y máxima
    @Matches(/(?=.*[a-z])/, { message: 'Debe contener al menos una letra minúscula' }) // Al menos una minúscula
    @Matches(/(?=.*[A-Z])/, { message: 'Debe contener al menos una letra mayúscula' }) // Al menos una mayúscula
    @Matches(/(?=.*\d)/, { message: 'Debe contener al menos un número' }) // Al menos un número
    password: string;
    
    @IsString() // Debe ser string
    @IsNotEmpty() // Obligatorio
    firstName: string;

    @IsString() // Debe ser string
    @IsNotEmpty() // Obligatorio
    lastName: string;

    @IsString() // Debe ser string
    @IsNotEmpty({ message: 'El teléfono es obligatorio' }) // Obligatorio
    @Matches(/^\+?[\d\s\-().]{10,20}$/, { message: 'Teléfono inválido' }) // Formato flexible con +, espacios, guiones y paréntesis
    phone: string;
    
    @IsString() // Debe ser string
    @IsNotEmpty({ message: 'El DNI es obligatorio' }) // Obligatorio
    @Matches(/^\d{7,12}$/, { message: 'El DNI debe contener entre 7 y 12 números' }) // Solo números, longitud 7–12
    dni: string;
    
    @IsString() // Debe ser string
    @IsOptional() // Opcional
    address?: string;

    @IsString() // Debe ser string
    @IsOptional() // Opcional
    city?: string;

    @IsString() // Debe ser string
    @IsOptional() // Opcional
    postalCode?: string;

    @IsString() // Debe ser string
    @IsOptional() // Opcional
    country?: string;
}
