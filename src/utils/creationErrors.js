export const getCreationError = (error, fallbackMessage) => {
  const response = error?.response;
  const data = response?.data || {};

  if (!response) {
    return {
      message: error?.code === "ECONNABORTED"
        ? "The request timed out. Check your connection and try again."
        : "Unable to reach the server. Check your connection and try again.",
      errors: {},
    };
  }

  const statusMessages = {
    401: "Your session expired. Please sign in and try again.",
    413: "The selected upload is too large.",
    429: "You are creating content too quickly. Please wait and try again.",
  };

  return {
    message: data.message || statusMessages[response.status] || fallbackMessage,
    errors: data.errors && typeof data.errors === "object" ? data.errors : {},
  };
};
