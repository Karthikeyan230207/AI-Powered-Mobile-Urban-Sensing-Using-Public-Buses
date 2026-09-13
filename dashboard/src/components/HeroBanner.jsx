import React from "react";
import { IconRoad } from "./icons";

const BADGES = ["AI Detects", "GPS Locates", "We Analyze", "Roads Improve"];

export default function HeroBanner() {
  return (
    <section className="hero">
      <div className="hero__scene" aria-hidden="true">
        <svg viewBox="0 0 900 260" preserveAspectRatio="xMidYMax slice" className="hero__svg">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bfe3fb" />
              <stop offset="55%" stopColor="#dff1fb" />
              <stop offset="100%" stopColor="#eef8ef" />
            </linearGradient>
          </defs>
          <rect width="900" height="260" fill="url(#sky)" />
          <circle cx="120" cy="55" r="60" fill="#ffffff" opacity="0.55" />
          <circle cx="740" cy="40" r="46" fill="#ffffff" opacity="0.5" />
          <g opacity="0.85">
            <rect x="520" y="90" width="34" height="110" fill="#bcd2e8" />
            <rect x="560" y="60" width="40" height="140" fill="#a9c4de" />
            <rect x="606" y="100" width="30" height="100" fill="#bcd2e8" />
            <rect x="642" y="75" width="36" height="125" fill="#a9c4de" />
            <rect x="684" y="110" width="28" height="90" fill="#bcd2e8" />
            <rect x="718" y="85" width="34" height="115" fill="#a9c4de" />
            <rect x="758" y="105" width="26" height="95" fill="#bcd2e8" />
          </g>
          <rect x="0" y="200" width="900" height="60" fill="#e7e9ee" />
          <rect x="0" y="197" width="900" height="6" fill="#d7dae1" />
          <g transform="translate(560,120)">
            <rect x="0" y="26" width="220" height="80" rx="16" fill="#2f6fee" />
            <rect x="0" y="26" width="220" height="30" rx="16" fill="#3f7bf2" />
            <rect x="14" y="36" width="44" height="34" rx="4" fill="#eaf3ff" />
            <rect x="66" y="36" width="44" height="34" rx="4" fill="#eaf3ff" />
            <rect x="118" y="36" width="44" height="34" rx="4" fill="#eaf3ff" />
            <rect x="170" y="36" width="34" height="34" rx="4" fill="#dbe9ff" />
            <rect x="0" y="78" width="220" height="10" fill="#1f4fc4" />
            <circle cx="36" cy="112" r="14" fill="#1f2937" />
            <circle cx="36" cy="112" r="6" fill="#9aa4b2" />
            <circle cx="184" cy="112" r="14" fill="#1f2937" />
            <circle cx="184" cy="112" r="6" fill="#9aa4b2" />
          </g>
        </svg>
      </div>

      <div className="hero__content">
        <div className="hero__eyebrow">
          <span className="hero__eyebrow-icon">
            <IconRoad size={13} strokeWidth={2.4} />
          </span>
          Road Damage Analytics
        </div>
        <h1>Safer Roads, Smarter Decisions</h1>
        <p>
          Real-time detection, analysis and monitoring of road damages using AI and public
          bus dashcams.
        </p>
      </div>

      <div className="hero__badges">
        {BADGES.map((badge, i) => (
          <React.Fragment key={badge}>
            {i > 0 && <span className="hero__badges-dot">•</span>}
            <span>{badge}</span>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
