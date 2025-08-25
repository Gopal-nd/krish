"use client";

import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { APIError } from "@/lib/errors";

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback((
    error: Error | APIError | string | unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = "An unexpected error occurred"
    } = options;

    // Normalize error object
    let errorMessage = fallbackMessage;
    let errorTitle = "Error";
    let errorDetails: any = null;

    if (typeof error === "string") {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error;
    } else if (typeof error === "object" && error !== null) {
      const apiError = error as APIError;
      if (apiError.message) {
        errorMessage = apiError.message;
        errorTitle = apiError.error || "Error";
        errorDetails = apiError.details;
      }
    }

    // Log error if requested
    if (logError) {
      console.error("Error handled:", {
        message: errorMessage,
        title: errorTitle,
        details: errorDetails,
        originalError: error
      });
    }

    // Show toast notification if requested
    if (showToast) {
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    }

    // Return normalized error for further processing
    return {
      message: errorMessage,
      title: errorTitle,
      details: errorDetails
    };
  }, [toast]);

  const handleAPIError = useCallback(async (response: Response) => {
    try {
      const errorData = await response.json();
      return handleError(errorData);
    } catch {
      // If response is not JSON, use status text
      return handleError({
        error: "API_ERROR",
        message: response.statusText || `HTTP ${response.status}`,
        statusCode: response.status
      });
    }
  }, [handleError]);

  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      handleError(error, options);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAPIError,
    handleAsyncOperation
  };
};
