import React from "react"

export default function Info(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <title>info</title>
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13.737 21.848a10.002 10.002 0 0 0 6.697-15.221a10 10 0 1 0-6.698 15.221Z" />
        <path strokeLinecap="square" d="M12 12v6m0-11V6" />
      </g>
    </svg>
  )
}
