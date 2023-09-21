import * as React from "react";
import { SVGProps } from "react";
export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 58 100"
    fill="none"
    {...props}
  >
    <path
      fill="url(#a)"
      d="m23.834 96.38-5.197-10.45-16.449 5.233C2.223 96.711 6.733 100 12.457 100c3.738 0 7.816-1.386 11.377-3.62Z"
    />
    <path
      fill="url(#b)"
      d="m0 91.088 18.434-5.864 4.728-14.204C10.298 71.192 0 80.8 0 91.034v.054Z"
    />
    <path
      fill="url(#c)"
      d="M46.638 27.71c-5.039-7.847-9.189-15.99-10.77-25.525C35.573.595 34.783 0 32.905 0c-.494 0-.889.199-.988.894v74.09c-1.877-1.688-4.643-2.582-7.904-2.582a24.37 24.37 0 0 0-.328.002l-4.41 13.25-17.195 5.47v.018l17.25-5.487 5.45 10.957c5.679-3.562 10.1-9.182 10.1-14.873V26.021c6.126 3.774 13.438 14.7 16.5 21.95 1.482 3.376 2.372 9.037 2.372 14.897 0 4.47-.692 9.137-2.372 13.606-.197.596-.296 1.093-.296 1.49 0 1.59.988 2.483 1.58 2.88l.198.1c.89.099 2.075-.298 2.57-1.987 0 0 2.568-9.435 2.568-17.182 0-12.414-5.138-24.134-11.362-34.066Z"
    />
    <defs>
      <radialGradient
        id="a"
        cx={0}
        cy={0}
        r={1}
        gradientTransform="matrix(0 50.2049 -27.9607 0 30.04 50.205)"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#294582" />
        <stop offset={1} stopColor="#96C4E0" />
      </radialGradient>
      <radialGradient
        id="b"
        cx={0}
        cy={0}
        r={1}
        gradientTransform="matrix(0 50.2049 -27.9607 0 30.04 50.205)"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#294582" />
        <stop offset={1} stopColor="#96C4E0" />
      </radialGradient>
      <radialGradient
        id="c"
        cx={0}
        cy={0}
        r={1}
        gradientTransform="matrix(0 50.2049 -27.9607 0 30.04 50.205)"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#294582" />
        <stop offset={1} stopColor="#96C4E0" />
      </radialGradient>
    </defs>
  </svg>
);
