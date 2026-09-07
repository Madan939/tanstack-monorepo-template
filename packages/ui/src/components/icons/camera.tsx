import React from "react"

export default function Camera(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <title>camera</title>
      <g fill="none">
        <path d="M15.5 3h-7L7 6H2v14h20V6h-5z" />
        <path d="M16 12.5a4 4 0 1 1-8 0a4 4 0 0 1 8 0" />
        <path stroke="currentColor" strokeWidth="2" d="M15.5 3h-7L7 6H2v14h20V6h-5z" />
        <path stroke="currentColor" strokeWidth="2" d="M16 12.5a4 4 0 1 1-8 0a4 4 0 0 1 8 0Z" />
      </g>
    </svg>
  )
}
