import React from "react"

export function Code(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48" {...props}>
      <title>code</title>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4">
        <path strokeLinejoin="round" d="M16 13L4 25.432L16 37m16-24l12 12.432L32 37" />
        <path d="m28 4l-7 40" />
      </g>
    </svg>
  )
}

export default Code
