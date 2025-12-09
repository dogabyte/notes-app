import { useState, useCallback, useEffect } from "react";
import { UseFormReturn, ValidationError } from "../types";
import { validateNoteData } from "../utils";

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => ValidationError[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (values: T) => void | Promise<void>;
}

export const useForm = <T extends Record<string, unknown>>(
  options: UseFormOptions<T>,
): UseFormReturn<T> => {
  const {
    initialValues,
    validate,
    validateOnChange = false,
    validateOnBlur = true,
    onSubmit,
  } = options;

  // Form state
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed values
  const isValid = Object.values(errors).every((err) => !err);
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  /** Type guard para notas */
  function isNoteData(obj: any): obj is { title: string; content: string } {
    return (
      obj && typeof obj.title === "string" && typeof obj.content === "string"
    );
  }

  /** Valida el formulario */
  const validateForm = useCallback(
    (formValues: T): Partial<Record<keyof T, string>> => {
      const validationErrors: Partial<Record<keyof T, string>> = {};

      if (validate) {
        const customErrors = validate(formValues);
        customErrors.forEach((error) => {
          validationErrors[error.field as keyof T] = error.message;
        });
      }

      if (isNoteData(formValues)) {
        const noteErrors = validateNoteData(formValues);
        noteErrors.forEach((error) => {
          validationErrors[error.field as keyof T] = error.message;
        });
      }

      return validationErrors;
    },
    [validate],
  );

  /** Maneja cambios en los campos */
  const handleChange = useCallback(
    (field: keyof T, value: T[keyof T]) => {
      const newValues = { ...values, [field]: value };
      setValues(newValues);

      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }

      if (validateOnChange) {
        const fieldErrors = validateForm(newValues);
        setErrors(fieldErrors);
      }
    },
    [values, errors, validateOnChange, validateForm],
  );

  /** Maneja blur de los campos */
  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      if (validateOnBlur) {
        const fieldErrors = validateForm(values);
        setErrors(fieldErrors);
      }
    },
    [values, validateOnBlur, validateForm],
  );

  /** Maneja submit del formulario */
  const handleSubmit = useCallback(
    async (submitHandler?: (values: T) => void | Promise<void>) => {
      try {
        setIsSubmitting(true);

        const allTouched = Object.keys(values).reduce(
          (acc, key) => {
            acc[key as keyof T] = true;
            return acc;
          },
          {} as Record<keyof T, boolean>,
        );
        setTouched(allTouched);

        const validationErrors = validateForm(values);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        const handler = submitHandler || onSubmit;
        if (handler) await handler(values);
      } catch (error) {
        console.error("Form submission error:", error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit],
  );

  /** Resetea el formulario */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /** Set values programáticamente */
  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  /** Set errors programáticamente */
  const setFormErrors = useCallback(
    (newErrors: Partial<Record<keyof T, string>>) => {
      setErrors((prev) => ({ ...prev, ...newErrors }));
    },
    [],
  );

  /** Props para inputs */
  const getFieldProps = useCallback(
    (field: keyof T) => ({
      name: field as string,
      value: values[field],
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => handleChange(field, e.target.value as any),
      onBlur: () => handleBlur(field),
      error: touched[field] ? errors[field] : undefined,
      hasError: Boolean(touched[field] && errors[field]),
    }),
    [values, errors, touched, handleChange, handleBlur],
  );

  /** Utility functions */
  const hasFieldError = useCallback(
    (field: keyof T) => Boolean(touched[field] && errors[field]),
    [touched, errors],
  );

  const getFieldError = useCallback(
    (field: keyof T) => (touched[field] ? errors[field] : undefined),
    [touched, errors],
  );

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /** Re-validate on value change si validateOnChange */
  useEffect(() => {
    if (validateOnChange && Object.keys(touched).length > 0) {
      const validationErrors = validateForm(values);
      setErrors(validationErrors);
    }
  }, [values, validateOnChange, validateForm, touched]);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues: setFormValues,
    setErrors: setFormErrors,
    hasFieldError,
    getFieldError,
    clearFieldError,
    clearErrors,
  };
};

export default useForm;
