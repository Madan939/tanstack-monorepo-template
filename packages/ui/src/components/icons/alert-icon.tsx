import React from "react"

export function Alert(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <title>alert</title>
      <g fill="none">
        <path
          stroke="currentColor"
          strokeWidth="1.5"
          d="M5.732 20.5c-2.29 0-3.723-2.498-2.581-4.5L9.419 5.006c1.144-2.008 4.018-2.008 5.163 0L20.849 16c1.142 2.002-.291 4.5-2.581 4.5z"
        />
        <path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M12 13.375V9" />
        <circle
          cx="1.25"
          cy="1.25"
          r="1.25"
          fill="currentColor"
          transform="matrix(1 0 0 -1 10.75 17.938)"
        />
      </g>
    </svg>
  )
}

export default Alert
