import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@workspace/ui/components/design/attachment"
import { Icon } from "@workspace/ui/components/shared/icon"
import { cn } from "@workspace/ui/lib/utils"
import * as React from "react"
import type { Control, FieldPath, FieldValues, RegisterOptions } from "react-hook-form"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"

export type FormFile = {
  id?: string
  name: string
  size?: number
  type?: string
  url?: string
  file?: File
}

type FormAttachmentProps<T extends FieldValues> = {
  name: FieldPath<T>
  control?: Control<T>
  label?: string
  description?: string
  required?: boolean
  multiple?: boolean
  accept?: string
  maxSizeMB?: number
  disabled?: boolean
  rules?: RegisterOptions<T, FieldPath<T>>
}

function formatBytes(bytes?: number): string {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FormAttachment<T extends FieldValues>({
  name,
  control,
  label,
  description,
  required,
  multiple = false,
  accept,
  maxSizeMB = 10,
  disabled,
  rules,
}: FormAttachmentProps<T>) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => {
        const valueList: FormFile[] = Array.isArray(field.value)
          ? field.value
          : field.value
            ? [field.value]
            : []

        const handleFiles = (files: FileList | null) => {
          if (!files || files.length === 0) return

          const newFiles: FormFile[] = Array.from(files)
            .filter((f) => f.size <= maxSizeMB * 1024 * 1024)
            .map((f) => ({
              id: `${f.name}-${Date.now()}-${Math.random()}`,
              name: f.name,
              size: f.size,
              type: f.type,
              file: f,
            }))

          if (multiple) {
            field.onChange([...valueList, ...newFiles])
          } else {
            field.onChange(newFiles[0] ?? null)
          }
        }

        const handleRemove = (index: number) => {
          if (multiple) {
            const updated = valueList.filter((_, i) => i !== index)
            field.onChange(updated)
          } else {
            field.onChange(null)
          }
        }

        return (
          <FormItem>
            {label ? <FormLabel required={required}>{label}</FormLabel> : null}
            <FormControl>
              <div className="flex flex-col gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  multiple={multiple}
                  disabled={disabled}
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-input bg-card text-muted-foreground hover:bg-muted/50 hover:border-primary/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-6 text-center transition-colors w-full",
                    disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <Icon name="upload" size={24} className="text-muted-foreground mb-2" />
                  <p className="text-foreground text-sm font-medium">
                    Click to upload {multiple ? "files" : "a file"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {accept ? `Accepted formats: ${accept}` : `Max size ${maxSizeMB}MB`}
                  </p>
                </button>

                {valueList.length > 0 && (
                  <AttachmentGroup className="flex-wrap gap-2">
                    {valueList.map((item, idx) => (
                      <Attachment key={item.id ?? `${item.name}-${idx}`} size="sm">
                        <AttachmentMedia variant="icon">
                          <Icon name="file" size={16} />
                        </AttachmentMedia>
                        <AttachmentContent>
                          <AttachmentTitle>{item.name}</AttachmentTitle>
                          {item.size ? (
                            <AttachmentDescription>{formatBytes(item.size)}</AttachmentDescription>
                          ) : null}
                        </AttachmentContent>
                        <AttachmentActions>
                          <AttachmentAction
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemove(idx)
                            }}
                          >
                            <Icon name="close" size={12} />
                          </AttachmentAction>
                        </AttachmentActions>
                      </Attachment>
                    ))}
                  </AttachmentGroup>
                )}
              </div>
            </FormControl>
            {description ? <FormDescription>{description}</FormDescription> : null}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export { FormAttachment }
