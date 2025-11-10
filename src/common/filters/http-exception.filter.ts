// en vez de poner try/catch en todos los controladores, se puede usar un filtro de excepciones global

import {
    ExceptionFilter, // Interfaz para crear filtros de excepción
    Catch, // Decorador para indicar qué excepciones atrapa el filtro
    ArgumentsHost, // Proporciona el contexto de la ejecución (HTTP, RPC, WS)
    HttpException, // Clase para excepciones HTTP de Nest (BadRequest, NotFound, etc.)
    HttpStatus, // Enum con códigos HTTP (200, 404, 500...)
  } from '@nestjs/common';
  import { Request, Response } from 'express'; // Tipos para Request / Response de Express

  // Interfaces para tipado explícito (evita uso de any)
  interface ErrorResponse {
    message?: string;
    [key: string]: unknown;
  }

  // Tipo para request con url opcional (Express Request ya tiene url como string, pero puede ser undefined en algunos contextos)
  type RequestWithUrl = Request & { url?: string };
  
  @Catch() // Atrapa *todas* las excepciones (si es solo HttpException: @Catch(HttpException))
  export class AllExceptionsFilter implements ExceptionFilter { // se define la clase AllExceptionsFilter que implementa el filtro de excepciones
    catch(exception: unknown, host: ArgumentsHost) { // se define el metodo catch que recibe la excepcion y el contexto de la ejecucion
        // ArgumentsHost es el contexto de la ejecucion, nativamente es un objeto que tiene el contexto de la ejecucion
        // switchToHttp() es un metodo que cambia el contexto de la ejecucion a HTTP (de Express)
        // getResponse() es un metodo que extrae el objeto Response de Express
        // getRequest() es un metodo que extrae el objeto Request de Express
      const ctx = host.switchToHttp(); // cambia al contexto HTTP (de Express)
      const response = ctx.getResponse<Response>(); // extrae el objeto Response de Express
      const request = ctx.getRequest<RequestWithUrl>(); // opcional: para información de la request (url, method)
  
      // Si la excepción es una HttpException de Nest, obtenemos el código y el body que definió
      // se obtiene el status de la excepcion; si es HttpException, se obtiene el status de la excepcion, sino, 
      // se asume que es un error interno y se retorna 500
      const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      // Obtenemos el payload (mensaje/objeto) de la HttpException o un mensaje por defecto
      const errorResponse = exception instanceof HttpException ? exception.getResponse() : { message: 'Error interno del servidor' };
      // Respondemos con JSON uniforme: statusCode, timestamp, path y el payload/calidad del error
      const errorMessage = typeof errorResponse === 'string' 
        ? errorResponse 
        : (errorResponse as ErrorResponse).message || errorResponse;
      response.status(status).json({
        statusCode: status,
        message: errorMessage,
        error: typeof errorResponse === 'object' ? errorResponse : undefined,
        timestamp: new Date().toISOString(),
        path: request?.url || null
      });
    }
  } 
  