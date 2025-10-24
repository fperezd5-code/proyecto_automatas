class ApiResponse {
  static success(data = null, message = 'Operación exitosa', statusCode = 200) {
    return {
      data: data,
      status: statusCode,
      message: message
    };
  }

  static error(message = 'Error en la operación', statusCode = 500, data = null) {
    return {
      data: data,
      status: statusCode,
      message: message
    };
  }

  static validationError(message = 'Error de validación', errors = null) {
    return {
      data: errors,
      status: 400,
      message: message
    };
  }

  static notFound(message = 'Recurso no encontrado') {
    return {
      data: null,
      status: 404,
      message: message
    };
  }
}

module.exports = ApiResponse;