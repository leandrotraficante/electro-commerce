import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, UseGuards, UseFilters, ParseIntPipe, Query } from '@nestjs/common'; 
// en nestJS se importan 
// lo que vendrian a ser las rutas en nodejs (GET, POST, PUT, DELETE, etc.), tambien se importan de manera nativa los http status y exceptions 
// para manejar los errores de manera correcta.
import { UsersService } from './users.service'; // se importa el servicio de usuarios para usar sus metodos 
import { CreateUserDto } from './dto/create-user.dto'; // se importa el dto de creacion para validaciones de datos de entrada
import { UpdateUserDto } from './dto/update-user.dto'; // se importa el dto de actualizacion para validaciones de datos de entrada
import { RolesGuard } from 'src/common/guards/roles.guard'; // se importa el guard de roles para validar los roles de los usuarios
import { Roles } from 'src/common/decorators/role.decorator'; // se importa el decorador de roles para validar los roles de los usuarios
import { RolesEnum } from 'src/common/enums/enums'; // se importa el enum de roles para validar los roles de los usuarios
import { AllExceptionsFilter } from 'src/common/filters/http-exception.filter'; // se importa el filtro de excepciones para manejar los errores de manera correcta
import { User } from './entities/user.entity'; // se importa la entidad User para tipado
import { ApiResponse, ApiListResponse, ApiMessageResponse, ApiPaginatedResponse } from 'src/common/types/api-response.types'; // se importan los tipos compartidos para respuestas de la API
import { UserResponseDto, toUserResponseDto } from './dto/user-response.dto'; // se importa el DTO de respuesta que excluye password y la función helper

@Controller('users') // se define el controlador de usuarios y se le asigna la ruta /users
@UseFilters(AllExceptionsFilter) // se usa el filtro de excepciones para manejar los errores de manera correcta
@Roles(RolesEnum.ADMIN) // valida que todos los métodos de este controlador requieran rol ADMIN
@UseGuards(RolesGuard)   // aplica el guard de roles a todo el controlador
export class UsersController { // se define la clase UsersController que implementa el controlador de usuarios 
  constructor(private readonly usersService: UsersService) { } // se inyecta el servicio de usuarios para usar sus metodos 

  @Post() // se define el metodo POST para crear un nuevo usuario
  async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<UserResponseDto>> { // se define el metodo create que recibe un body con los datos del nuevo usuario
    // se validan los datos de entrada con el dto de creacion
      const newUser = await this.usersService.create(createUserDto); // se crea el nuevo usuario con los datos de entrada
      return { // la respuesta es un objeto con el status code, mensaje y datos del nuevo usuario
        statusCode: HttpStatus.CREATED, // se retorna el status code 201 (CREATED)
        message: 'Usuario creado exitosamente', // se retorna el mensaje de exito
        data: toUserResponseDto(newUser), // se retorna los datos del nuevo usuario sin password
    }
  } // no se usa try/catch porque se usa el filtro de excepciones para manejar los errores de manera correcta

  @Get() // se define el metodo GET para obtener todos los usuarios con paginación
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number, // Query param opcional para página (default: 1)
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number, // Query param opcional para límite (default: 10)
  ): Promise<ApiPaginatedResponse<UserResponseDto>> {
    const result = await this.usersService.findAll(page || 1, limit || 10); // se obtiene la lista paginada de usuarios desde el service
    return {
      statusCode: HttpStatus.OK, // status code 200
      message: 'Usuarios obtenidos exitosamente', // mensaje de exito
      data: result.users.map(toUserResponseDto), // datos de los usuarios sin password
      total: result.total, // total de usuarios en la base de datos
      page: result.page, // página actual
      limit: result.limit, // límite de registros por página
    }
  }

  @Get(':id') // GET /users/:id
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<UserResponseDto>> { // se parsea el id a número
    const userById = await this.usersService.findOne(id); // NotFoundException ya se lanza en el service si no existe
    return {
      statusCode: HttpStatus.OK, // status code 200
      message: 'Usuario obtenido exitosamente', // mensaje de exito
      data: toUserResponseDto(userById), // usuario encontrado sin password
    }
  }
  
  @Patch(':id') // PATCH /users/:id
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<ApiResponse<UserResponseDto>> {
    const updatedUser = await this.usersService.update(id, updateUserDto); // NotFoundException ya se lanza en el service si no existe
    return {
      statusCode: HttpStatus.OK, // status code 200
      message: 'Usuario actualizado exitosamente', // mensaje de exito
      data: toUserResponseDto(updatedUser), // usuario actualizado sin password
    }
  }

  @Delete(':id') // DELETE /users/:id (soft delete - desactiva usuario)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ApiMessageResponse> {
    await this.usersService.softDelete(id); // se realiza softDelete (usuario queda inactivo y no eliminado fisicamente)
    return {
      statusCode: HttpStatus.OK, // status code 200
      message: 'Usuario desactivado exitosamente', // mensaje de exito
    }
  }

  @Get('email/:email') // GET /users/email/:email - obtener usuario por email
  async findByEmail(@Param('email') email: string): Promise<ApiResponse<UserResponseDto>> {
    const user = await this.usersService.findByEmail(email); // NotFoundException ya se lanza en el service si no existe
    return {
      statusCode: HttpStatus.OK, // status code 200
      message: 'Usuario obtenido exitosamente', // mensaje de exito
      data: toUserResponseDto(user), // usuario encontrado sin password
    }
  }

  @Get('active/list') // GET /users/active/list - obtener usuarios activos
  async findActive(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number, // Query param opcional para página
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number, // Query param opcional para límite
  ): Promise<ApiPaginatedResponse<UserResponseDto>> {
    const users = await this.usersService.findActive(); // se obtienen solo usuarios activos
    const startIndex = ((page || 1) - 1) * (limit || 10); // calcula índice de inicio para paginación manual
    const endIndex = startIndex + (limit || 10); // calcula índice de fin
    const paginatedUsers = users.slice(startIndex, endIndex); // aplica paginación manual
    return {
      statusCode: HttpStatus.OK, // status code 200
      message: 'Usuarios activos obtenidos exitosamente', // mensaje de exito
      data: paginatedUsers.map(toUserResponseDto), // usuarios activos sin password
      total: users.length, // total de usuarios activos
      page: page || 1, // página actual
      limit: limit || 10, // límite de registros por página
    }
  }

  @Get('inactive/list') // GET /users/inactive/list - obtener usuarios inactivos
  async findInactive(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number, // Query param opcional para página
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number, // Query param opcional para límite
  ): Promise<ApiPaginatedResponse<UserResponseDto>> {
    const users = await this.usersService.findInactive(); // se obtienen solo usuarios inactivos
    const startIndex = ((page || 1) - 1) * (limit || 10); // calcula índice de inicio para paginación manual
    const endIndex = startIndex + (limit || 10); // calcula índice de fin
    const paginatedUsers = users.slice(startIndex, endIndex); // aplica paginación manual
    return {
      statusCode: HttpStatus.OK, // status code 200
      message: 'Usuarios inactivos obtenidos exitosamente', // mensaje de exito
      data: paginatedUsers.map(toUserResponseDto), // usuarios inactivos sin password
      total: users.length, // total de usuarios inactivos
      page: page || 1, // página actual
      limit: limit || 10, // límite de registros por página
    }
  }

  @Get('role/:role') // GET /users/role/:role - obtener usuarios por rol
  async findByRole(
    @Param('role') role: RolesEnum, // se parsea el rol del enum
    @Query('page', new ParseIntPipe({ optional: true })) page?: number, // Query param opcional para página
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number, // Query param opcional para límite
  ): Promise<ApiPaginatedResponse<UserResponseDto>> {
    const users = await this.usersService.findByRole(role); // se obtienen usuarios por rol
    const startIndex = ((page || 1) - 1) * (limit || 10); // calcula índice de inicio para paginación manual
    const endIndex = startIndex + (limit || 10); // calcula índice de fin
    const paginatedUsers = users.slice(startIndex, endIndex); // aplica paginación manual
    return {
      statusCode: HttpStatus.OK, // status code 200
      message: 'Usuarios obtenidos exitosamente', // mensaje de exito
      data: paginatedUsers.map(toUserResponseDto), // usuarios por rol sin password
      total: users.length, // total de usuarios con ese rol
      page: page || 1, // página actual
      limit: limit || 10, // límite de registros por página
    }
  }

  @Patch(':id/restore') // PATCH /users/:id/restore - restaurar usuario desactivado
  async restore(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<UserResponseDto>> {
    const restoredUser = await this.usersService.restore(id); // restaura el usuario (marca como activo)
    return {
      statusCode: HttpStatus.OK, // status code 200
      message: 'Usuario restaurado exitosamente', // mensaje de exito
      data: toUserResponseDto(restoredUser), // usuario restaurado sin password
    }
  }
}
