// Import React context API and hooks for state + lifecycle handling
import { createContext, useEffect, useState } from "react";

// Service that listens to authentication state changes (likely Firebase auth listener)
import { subscribeToAuthChanges } from "../services/authService";

// Create authentication context with default fallback values
// This ensures components consuming the context won't crash if not wrapped in provider
export const AuthContext = createContext({
  user: null,     // Holds authenticated user object
  loading: true,  // Indicates if auth state is still being determined
});

// Provider component that wraps the application and supplies auth state
export const AuthProvider = ({ children }) => {

  // State to store current authenticated user
  const [user, setUser] = useState(null);

  // Loading state to prevent UI from rendering before auth is resolved
  const [loading, setLoading] = useState(true);

  // useEffect runs once on component mount to initialize auth listener
  useEffect(() => {

    // Subscribe to authentication state changes (e.g., login/logout events)
    const unsubscribe = subscribeToAuthChanges((authUser) => {

      // Update user state whenever auth state changes
      setUser(authUser);

      // Mark loading as complete after first auth response
      setLoading(false);
    });

    // Cleanup subscription when component unmounts
    // Prevents memory leaks and duplicate listeners
    return () => unsubscribe();

  }, []); // Empty dependency array ensures this runs only once

  return (
    // Provide auth state globally to all child components
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};