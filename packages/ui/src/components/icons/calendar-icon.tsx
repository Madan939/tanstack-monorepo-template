import React from "react"

export default function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <title>calendar</title>
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <rect width="20" height="18" x="2" y="4" rx="4" />
        <path d="M8 2v4m8-4v4M2 10h20" />
      </g>
    </svg>
  )
}
