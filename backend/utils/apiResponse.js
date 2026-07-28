/**
 * Centralized API Response Helper
 */
export const sendResponse = (res, statusCode, message, data = null) => {
  const responseBody = {
    success: statusCode >= 200 && statusCode < 300,
    message
  };

  if (data !== null) {
    if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0) {
      Object.assign(responseBody, data);
    } else {
      responseBody.data = data;
    }
  }

  return res.status(statusCode).json(responseBody);
};
