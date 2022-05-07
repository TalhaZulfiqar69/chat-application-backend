// Generic Responses

class ResponseHelper {

  /**
 * @param success  bool value
 * @param message  response message text
 * @param data  response data
 * @param statusCode response status
 */

  static getResponse({
    statusCode = 500,
    success = false,
    responseMessage = "ERROOR",
    data = {},
  }) {
    let response = {
      status: statusCode,
      success: success,
      message: responseMessage,
      data: data,
    };
    return response;
  }
}

module.exports = ResponseHelper;
