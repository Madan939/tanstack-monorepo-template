import React from "react"

export function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <title>clock</title>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5">
        <path strokeMiterlimit="10" d="m15.172 15.172l-3.167-3.167V5.672" />
        <path strokeLinejoin="round" d="M12 21.5a9.5 9.5 0 1 0 0-19a9.5 9.5 0 0 0 0 19" />
      </g>
    </svg>
  )
}

export default Clock
