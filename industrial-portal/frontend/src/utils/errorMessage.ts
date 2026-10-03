export const getUserFacingErrorMessage = (error: unknown, fallback: string): string => {
  if (!(error instanceof Error)) return fallback;

  const message = error.message.split(/\r?\n/, 1)[0].trim();
  if (!message || message === 'undefined' || message === 'null') return fallback;
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return 'Unable to connect to the service. Check the backend connection and try again.';
  }

  return message;
};
