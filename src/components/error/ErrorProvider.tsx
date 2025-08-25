"use client";

import React, { createContext, useContext, useEffect } from "react";
import { ErrorBoundary, PageErrorFallback } from "./ErrorBoundary";
import { useErrorHandler } from "@/hooks/use-error-handler";

interface ErrorContextType {
  handleError: (error: Error | unknown, options?: any) => void;
  handleAPIError: (response: Response) => Promise<void>;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export const useErrorContext = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useErrorContext must be used within ErrorProvider");
  }
  return context;
};

interface ErrorProviderProps {
  children: React.ReactNode;
  showErrorBoundary?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({
  children,
  showErrorBoundary = true,
  onError
}) => {
  const { handleError, handleAPIError } = useErrorHandler();

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      handleError(event.reason, {
        fallbackMessage: "An unexpected error occurred. Please refresh the page."
      });
    };

    const handleUnhandledError = (event: ErrorEvent) => {
      console.error("Unhandled error:", event.error);
      handleError(event.error, {
        fallbackMessage: "An unexpected error occurred. Please refresh the page."
      });
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleUnhandledError);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleUnhandledError);
    };
  }, [handleError]);

  const contextValue: ErrorContextType = {
    handleError,
    handleAPIError: async (response: Response) => {
      const data = await response.json();
      throw new Error(data.message);
    } 
  };

  if (showErrorBoundary) {
    return (
      <ErrorContext.Provider value={contextValue}>
        <ErrorBoundary
          fallback={PageErrorFallback}
          onError={onError}
        >
          {children}
        </ErrorBoundary>
      </ErrorContext.Provider>
    );
  }

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
};

// Higher-order component to wrap pages with error handling
export function withErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    showErrorBoundary?: boolean;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  }
) {
  const WrappedComponent = (props: P) => (
    <ErrorProvider
      showErrorBoundary={options?.showErrorBoundary ?? true}
      onError={options?.onError}
    >
      <Component {...props} />
    </ErrorProvider>
  );

  WrappedComponent.displayName = `withErrorHandling(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
