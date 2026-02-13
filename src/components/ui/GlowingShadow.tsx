"use client"

import { useEffect, type ReactNode } from "react"

interface GlowingShadowProps {
  children: ReactNode;
  className?: string; // Add className prop support
}

export function GlowingShadow({ children, className }: GlowingShadowProps) { // Accept className

  return (
    <>
      <style jsx>{`
        @property --hue {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --rotate {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --bg-y {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --bg-x {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --glow-translate-y {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --bg-size {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --glow-opacity {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --glow-blur {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --glow-scale {
          syntax: "<number>";
          inherits: true;
          initial-value: 2;
        }
        @property --glow-radius {
          syntax: "<number>";
          inherits: true;
          initial-value: 2;
        }
        @property --white-shadow {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }

        .glow-container {
          --card-color: rgba(255, 255, 255, 0.9);
          --text-color: #404040;
          --card-radius: 24px;
          --card-width: 100%; /* Changed to 100% to fill container */
          --border-width: 2px;
          --bg-size: 1;
          --hue: 0; /* Red Hue */
          --hue-speed: 1;
          --rotate: 0;
          --animation-speed: 4s;
          --interaction-speed: 0.55s;
          --glow-scale: 1.05; /* Drastically reduced */
          --scale-factor: 1;
          --glow-blur: 1.5; /* Drastically reduced */
          --glow-opacity: 0.4;
          --glow-radius: 20; /* Drastically reduced */
          --glow-rotate-unit: 1deg;

          width: 100%;
          min-height: 300px; 
          aspect-ratio: auto;
          color: var(--text-color);
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          border-radius: var(--card-radius);
          cursor: pointer;
        }

        .glow-container:before,
        .glow-container:after {
          content: "";
          display: block;
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: var(--card-radius);
        }

        .glow-content {
          position: absolute; 
          background: var(--card-color);
          border-radius: calc(var(--card-radius) * 0.9);
          display: flex;
          align-items: center;
          justify-content: center;  
          width: calc(100% - 2px); /* Very tight border */
          height: calc(100% - 2px); /* Very tight border */
        }

        .glow-content:before {
          content: "";
          display: block;
          position: absolute;
          width: calc(100% + var(--border-width)); /* Exact match */
          height: calc(100% + var(--border-width));
          border-radius: calc(var(--card-radius) * 0.9);
          box-shadow: 0 0 2px rgba(0,0,0,0.1); /* Minimal shadow */
          mix-blend-mode: normal; 
          z-index: -1;
          /* Adjusted gradient for Meritz Red theme */
          background: radial-gradient(
            30% 30% at calc(var(--bg-x) * 1%) calc(var(--bg-y) * 1%),
            hsl(calc(var(--hue) + 0) 100% 60%) calc(0% * var(--bg-size)),    
            hsl(calc(var(--hue) + 10) 100% 70%) calc(20% * var(--bg-size)),  
            hsl(calc(var(--hue) + 340) 100% 50%) calc(40% * var(--bg-size)), 
            transparent 100%
          );
          animation: hue-animation var(--animation-speed) linear infinite,
                     rotate-bg var(--animation-speed) linear infinite;
          transition: --bg-size var(--interaction-speed) ease;
        }

        .glow {
          --glow-translate-y: 0;
          display: block;
          position: absolute;
          width: 100%; 
          height: 100%;
          animation: rotate var(--animation-speed) linear infinite;
          transform: rotateZ(calc(var(--rotate) * var(--glow-rotate-unit)));
          transform-origin: center;
          border-radius: calc(var(--glow-radius) * 10vw);
          pointer-events: none; 
        }

        .glow:after {
          content: "";
          display: block;
          z-index: -2;
          filter: blur(calc(var(--glow-blur) * 10px));
          width: 50%; 
          height: 50%;
          left: 25%;
          top: 25%;
          background: hsl(0deg 100% 60%); 
          position: relative;
          border-radius: calc(var(--glow-radius) * 10vw);
          animation: hue-animation var(--animation-speed) linear infinite;
          transform: scaleY(calc(var(--glow-scale) * var(--scale-factor) / 1.1))
                     scaleX(calc(var(--glow-scale) * var(--scale-factor) * 1.2))
                     translateY(calc(var(--glow-translate-y) * 1%));
          opacity: var(--glow-opacity);
        }

        .glow-container:hover .glow-content {
          box-shadow: 0 0 calc(var(--white-shadow) * 0.2vw) calc(var(--white-shadow) * 0.05vw) rgba(230, 0, 0, 0.1); /* Minimal hover shadow */
          animation: shadow-pulse calc(var(--animation-speed) * 2) linear infinite;
        }

        .glow-container:hover .glow-content:before {
          --bg-size: 15;
          animation-play-state: paused;
          transition: --bg-size var(--interaction-speed) ease;
        }

        .glow-container:hover .glow {
          --glow-blur: 1;
          --glow-opacity: 0.5;
          --glow-scale: 1.2; /* Tighter hover scale */
          --glow-radius: 0;
          --rotate: 900;
          --glow-rotate-unit: 0;
          --scale-factor: 1.1;
          animation-play-state: paused;
        }

        .glow-container:hover .glow:after {
          --glow-translate-y: 0;
          animation-play-state: paused;
          transition: --glow-translate-y 0s ease, --glow-blur 0.05s ease,
                      --glow-opacity 0.05s ease, --glow-scale 0.05s ease,
                      --glow-radius 0.05s ease;
        }

        @keyframes shadow-pulse {
          0%, 24%, 46%, 73%, 96% {
            --white-shadow: 0.5;
          }
          12%, 28%, 41%, 63%, 75%, 82%, 98% {
            --white-shadow: 2.5;
          }
          6%, 32%, 57% {
            --white-shadow: 1.3;
          }
          18%, 52%, 88% {
            --white-shadow: 3.5;
          }
        }

        @keyframes rotate-bg {
          0% {
            --bg-x: 0;
            --bg-y: 0;
          }
          25% {
            --bg-x: 100;
            --bg-y: 0;
          }
          50% {
            --bg-x: 100;
            --bg-y: 100;
          }
          75% {
            --bg-x: 0;
            --bg-y: 100;
          }
          100% {
            --bg-x: 0;
            --bg-y: 0;
          }
        }

        @keyframes rotate {
          from {
            --rotate: -70;
            --glow-translate-y: -65;
          }
          25% {
            --glow-translate-y: -65;
          }
          50% {
            --glow-translate-y: -65;
          }
          60%, 75% {
            --glow-translate-y: -65;
          }
          85% {
            --glow-translate-y: -65;
          }
          to {
            --rotate: calc(360 - 70);
            --glow-translate-y: -65;
          }
        }

        @keyframes hue-animation {
          0% {
            --hue: 0;
          }
          50% {
            --hue: 10;
          }
          100% {
            --hue: 0;
          }
        }
      `}</style>

      <div className={`glow-container ${className || ''}`} role="button">
        <span className="glow"></span>
        <div className="glow-content">{children}</div>
      </div>
    </>
  )
}
