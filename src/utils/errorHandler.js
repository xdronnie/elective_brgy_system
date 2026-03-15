import { logErrorToFirestore } from "../services/errorService";

export const handleAppError = async ({
  error,
  source = "unknown",
  user = null,
  metadata = {},
  fallbackMessage = "Something went wrong.",
}) => {
  console.error(`[${source}]`, error);

  await logErrorToFirestore({
    error,
    source,
    user,
    metadata,
  });

  return {
    success: false,
    message: error?.message || fallbackMessage,
  };
};