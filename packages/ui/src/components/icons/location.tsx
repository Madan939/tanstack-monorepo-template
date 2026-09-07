import React from "react"

export function Location(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <title>location</title>
      <g fill="none" stroke="currentColor" strokeLinejoin="round">
        <path strokeWidth="3" d="M12 11h.01v.01H12z" />
        <path strokeWidth="2" d="m12 22l5.5-5.5a7.778 7.778 0 1 0-11 0z" />
      </g>
    </svg>
  )
}

export default Location
