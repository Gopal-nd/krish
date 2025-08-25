"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  label?: string;
  name?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "textarea" | "select" | "checkbox";
  value?: string | number | boolean;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  success?: boolean;
  hint?: string;
  className?: string;

  // For select fields
  options?: Array<{ value: string; label: string }>;

  // For textarea
  rows?: number;

  // Validation
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validationRules?: ValidationRule[];
}

export interface ValidationRule {
  rule: (value: any) => boolean;
  message: string;
  type?: "error" | "warning";
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  required,
  disabled,
  error,
  success,
  hint,
  className,
  options = [],
  rows = 3,
  validateOnChange = false,
  validateOnBlur = true,
  validationRules = [],
  ...props
}) => {
  const [internalError, setInternalError] = React.useState<string>("");
  const [touched, setTouched] = React.useState(false);

  const displayError = error || (touched ? internalError : "");
  const showSuccess = success && !displayError && value && touched;

  const validateValue = React.useCallback((val: any): string => {
    if (required && (!val || val === "")) {
      return `${label || name} is required`;
    }

    for (const rule of validationRules) {
      if (!rule.rule(val)) {
        return rule.message;
      }
    }

    // Type-specific validation
    if (type === "email" && val) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        return "Please enter a valid email address";
      }
    }

    if (type === "url" && val) {
      try {
        new URL(val);
      } catch {
        return "Please enter a valid URL";
      }
    }

    if (type === "number" && val !== "" && val !== undefined) {
      const num = Number(val);
      if (isNaN(num)) {
        return "Please enter a valid number";
      }
    }

    return "";
  }, [required, label, name, type, validationRules]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === "number" ? Number(e.target.value) : e.target.value;
    onChange?.(newValue);

    if (validateOnChange) {
      setInternalError(validateValue(newValue));
    }
  };

  const handleSelectChange = (newValue: string) => {
    onChange?.(newValue);
    setTouched(true);

    if (validateOnChange) {
      setInternalError(validateValue(newValue));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    onChange?.(checked);
    setTouched(true);
  };

  const handleBlur = () => {
    setTouched(true);
    if (validateOnBlur) {
      setInternalError(validateValue(value));
    }
    onBlur?.();
  };

  const inputId = name || `field-${Math.random().toString(36).substr(2, 9)}`;

  const inputClassName = cn(
    "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    {
      "border-red-500 focus-visible:ring-red-500": displayError,
      "border-green-500 focus-visible:ring-green-500": showSuccess,
    }
  );

  const renderInput = () => {
    const commonProps = {
      id: inputId,
      name,
      placeholder,
      disabled,
      className: inputClassName,
      onBlur: handleBlur,
    };

    switch (type) {
      case "textarea":
        return (
          <Textarea
            {...commonProps}
            rows={rows}
            value={value as string || ""}
            onChange={handleChange}
          />
        );

      case "select":
        return (
          <Select
            value={String(value || "")}
            onValueChange={handleSelectChange}
            disabled={disabled}
          >
            <SelectTrigger className={inputClassName}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={inputId}
              checked={Boolean(value)}
              onCheckedChange={handleCheckboxChange}
              disabled={disabled}
            />
            {label && (
              <Label
                htmlFor={inputId}
                className={cn(
                  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                  displayError && "text-red-600"
                )}
              >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            )}
          </div>
        );

      default:
        return (
          <Input
            {...commonProps}
            type={type}
            value={value as string || ""}
            onChange={handleChange}
          />
        );
    }
  };

  // For checkbox, we don't need the outer label structure
  if (type === "checkbox") {
    return (
      <div className={className}>
        {renderInput()}
        {(displayError || hint) && (
          <div className="mt-1">
            {displayError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {displayError}
              </p>
            )}
            {hint && !displayError && (
              <p className="text-sm text-gray-500">{hint}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
        {label && type !== 'checkbox' as any && (
        <Label
          htmlFor={inputId}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            displayError && "text-red-600",
            showSuccess && "text-green-600"
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        {renderInput()}

        {/* Success/Error icons */}
        {displayError && (
          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500 pointer-events-none" />
        )}
        {showSuccess && (
          <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500 pointer-events-none" />
        )}
      </div>

      {/* Error, success, or hint message */}
      {(displayError || hint || showSuccess) && (
        <div className="min-h-[1.25rem]">
          {displayError && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {displayError}
            </p>
          )}
          {showSuccess && !displayError && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Looks good!
            </p>
          )}
          {hint && !displayError && !showSuccess && (
            <p className="text-sm text-gray-500">{hint}</p>
          )}
        </div>
      )}
    </div>
  );
};
