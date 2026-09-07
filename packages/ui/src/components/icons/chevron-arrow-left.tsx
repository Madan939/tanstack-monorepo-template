import React from "react"

export default function ChevronArrowLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <title>chevron-arrow-left</title>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m15 4l-8 8l8 8"
      />
    </svg>
  )
}
