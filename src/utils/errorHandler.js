import { logErrorToFirestore } from "../services/errorService";


// =====================================
// CENTRALIZED APPLICATION ERROR HANDLER
// =====================================

// This function standardizes how errors are handled across the entire system
// It ensures:
// 1. consistent error logging
// 2. structured error response
// 3. centralized debugging through Firestore logs
export const handleAppError = async ({
  error,
  source = "unknown",
  user = null,
  metadata = {},
  fallbackMessage = "Something went wrong.",
}) => {

  // Log error to browser console with source context
  console.error(`[${source}]`, error);

  // Persist error into Firestore for monitoring and debugging
  await logErrorToFirestore({
    error,
    source,
    user,
    metadata,
  });

  // Return standardized error response for UI consumption
  return {
    success: false,
    message: error?.message || fallbackMessage,
  };
};