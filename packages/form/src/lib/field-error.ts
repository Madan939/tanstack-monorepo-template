import type { Path, UseFormReturn } from "react-hook-form"

/**
 * Handle server-side field errors and set them on the form.
 * Mirrors `@chatboq-frontend` `handleFieldError` for parity.
 *
 * @param form - The react-hook-form instance
 * @param fieldErrors - API error object containing field errors
 * @param fieldMap - Optional mapping from error keys to form paths
 */
export function handleFieldError<TSchema extends Record<string, unknown>>(
  form: UseFormReturn<TSchema>,
  fieldErrors: {
    [key: string]: string | undefined
  },
  fieldMap?: {
    [key: string]: Path<TSchema>
  },
) {
  if (!fieldErrors) return

  Object.keys(fieldErrors).forEach((key) => {
    const message = fieldErrors[key]
    if (!message) return

    const formPath = (fieldMap?.[key] || key) as Path<TSchema>

    form.setError(formPath, {
      type: "server",
      message,
    })
  })
}
