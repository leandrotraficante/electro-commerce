import { IsEmail, IsNotEmpty, IsString, IsOptional, Length, Matches, IsNumber, Min, Max } from 'class-validator';

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

    @IsString({ message: 'Debe ingresar un teléfono válido' })
    @IsNotEmpty({ message: 'El teléfono es obligatorio' })
    @Matches(/^\+?\d[\d\s\-()]{7,19}$/, { message: 'Teléfono inválido' })
    phone: string;
    
    @IsNumber({}, { message: 'Debe ingresar un DNI válido' })
    @IsNotEmpty({ message: 'El DNI es obligatorio' })
    @Min(1000000, { message: 'El DNI debe tener al menos 7 dígitos' })
    @Max(999999999999, { message: 'El DNI debe tener como máximo 12 dígitos' })
    dni: number;
    
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
