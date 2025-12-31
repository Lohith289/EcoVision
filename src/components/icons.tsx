import type { SVGProps } from "react";

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.5 9.5 21 3" />
        <path d="M6 3h5v5" />
        <path d="M3 11v5l7 7 7-7v-5L3 11z" />
        <path d="m3 11 7 7" />
        <path d="m21 11-7 7" />
      </svg>
    )
  }
