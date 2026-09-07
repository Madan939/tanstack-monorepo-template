import { Typography } from "@workspace/ui"

type FormHeaderProps = {
  heading: string
  description: string
}

export function FormHeader({ heading, description }: FormHeaderProps) {
  return (
    <div className="grid gap-1">
      <Typography.h3>{heading}</Typography.h3>
      <Typography variant="muted">{description}</Typography>
    </div>
  )
}
