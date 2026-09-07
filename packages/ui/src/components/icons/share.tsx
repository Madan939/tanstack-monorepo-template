import React from "react"

export default function Share(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <title>share</title>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M9.5 12a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0m5-5.5l-5 3.5m5 7.5l-5-3.5m10 4.5a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0m0-13a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0"
      />
    </svg>
  )
}
