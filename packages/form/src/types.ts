import type { Path } from "react-hook-form"

export type FieldError<T> = Partial<Record<Path<T>, string>>
