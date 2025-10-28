import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, UseGuards, UseFilters, ParseIntPipe } from '@nestjs/common'; 
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

@Controller('users') // se define el controlador de usuarios y se le asigna la ruta /users
@UseFilters(AllExceptionsFilter) // se usa el filtro de excepciones para manejar los errores de manera correcta
@Roles(RolesEnum.ADMIN) // valida que todos los métodos de este controlador requieran rol ADMIN
@UseGuards(RolesGuard)   // aplica el guard de roles a todo el controlador
export class UsersController { // se define la clase UsersController que implementa el controlador de usuarios 
  constructor(private readonly usersService: UsersService) { } // se inyecta el servicio de usuarios para usar sus metodos 

  @Post() // se define el metodo POST para crear un nuevo usuario
  async create(@Body() createUserDto: CreateUserDto) { // se define el metodo create que recibe un body con los datos del nuevo usuario
    // se validan los datos de entrada con el dto de creacion
      const newUser = await this.usersService.create(createUserDto); // se crea el nuevo usuario con los datos de entrada
      return { // la respuesta es un objeto con el status code, mensaje y datos del nuevo usuario
        statusCode: HttpStatus.CREATED, // se retorna el status code 201 (CREATED)
        message: 'User created successfully', // se retorna el mensaje de exito
        data: newUser, // se retorna los datos del nuevo usuario
    }
  } // no se usa try/catch porque se usa el filtro de excepciones para manejar los errores de manera correcta

  @Get() // se define el metodo GET para obtener todos los usuarios
  async findAll() {
    const users = await this.usersService.findAll(); // se obtiene la lista de usuarios desde el service
    return {
      statusCode: HttpStatus.OK, // status code 200
      message: 'Users fetched successfully', // mensaje de exito
      data: users, // datos de los usuarios
    }
  }

  @Get(':id') // GET /users/:id
  async findOne(@Param('id', ParseIntPipe) id: number) { // se parsea el id a número
    const userById = await this.usersService.findOne(id); // NotFoundException ya se lanza en el service si no existe
    return {
      statusCode: HttpStatus.OK, // status code 200
      message: 'User fetched successfully', // mensaje de exito
      data: userById, // usuario encontrado
    }
  }
  
  @Patch(':id') // PATCH /users/:id
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.update(id, updateUserDto); // NotFoundException ya se lanza en el service si no existe
    return {
      statusCode: HttpStatus.OK, // status code 200
      message: 'User updated successfully', // mensaje de exito
      data: updatedUser, // usuario actualizado
    }
  }

  @Delete(':id') // DELETE /users/:id
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.softDelete(id); // se realiza softDelete (usuario queda inactivo y no eliminado fisicamente)
    return {
      statusCode: HttpStatus.OK, // status code 200
      message: 'User deactivated successfully', // mensaje de exito
    }
  }
}
