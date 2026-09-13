import React from "react";

const base = (props) => ({
  width: props.size || 18,
  height: props.size || 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: props.strokeWidth || 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export const IconHome = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10v9a1 1 0 0 0 1 1H10v-5.5h4V20h3.5a1 1 0 0 0 1-1v-9" />
  </svg>
);

export const IconRoad = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M9 3 4 21" />
    <path d="M15 3l5 18" />
    <path d="M12 3v2.2" />
    <path d="M12 9.4v2.2" />
    <path d="M12 15.6v2.2" />
  </svg>
);

export const IconWarning = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M10.3 4.2 2.9 17a1.8 1.8 0 0 0 1.55 2.7h15.1A1.8 1.8 0 0 0 21.1 17L13.7 4.2a1.8 1.8 0 0 0-3.4 0Z" />
    <path d="M12 9.7v4" />
    <circle cx="12" cy="17" r="0.15" fill="currentColor" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const IconMapPin = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.4" />
  </svg>
);

export const IconDocument = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M7 3.5h7L19 8v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
    <path d="M14 3.5V8h5" />
    <path d="M9 13h6M9 16.5h6" />
  </svg>
);

export const IconGear = (p) => (
  <svg {...base(p)} {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l1.9-1.5-2-3.4-2.3.7a7.7 7.7 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.3a7.7 7.7 0 0 0-2.6 1.5l-2.3-.7-2 3.4L4.6 10.5a7.6 7.6 0 0 0 0 3l-1.9 1.5 2 3.4 2.3-.7c.77.66 1.65 1.17 2.6 1.5l.4 2.3h4l.4-2.3a7.7 7.7 0 0 0 2.6-1.5l2.3.7 2-3.4-1.9-1.5Z" />
  </svg>
);

export const IconBus = (p) => (
  <svg {...base(p)} {...p}>
    <rect x="4" y="4.5" width="16" height="12" rx="2.4" />
    <path d="M4 11h16" />
    <path d="M7.5 16.5V19M16.5 16.5V19" />
    <circle cx="8" cy="19" r="1.1" />
    <circle cx="16" cy="19" r="1.1" />
    <path d="M7 8h3M14 8h3" />
  </svg>
);

export const IconSearch = (p) => (
  <svg {...base(p)} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-3.6-3.6" />
  </svg>
);

export const IconCalendar = (p) => (
  <svg {...base(p)} {...p}>
    <rect x="3.5" y="5" width="17" height="16" rx="2" />
    <path d="M3.5 9.5h17" />
    <path d="M8 3v4M16 3v4" />
  </svg>
);

export const IconBell = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M6 9.5a6 6 0 0 1 12 0c0 4.2 1.3 5.6 1.3 5.6H4.7S6 13.7 6 9.5Z" />
    <path d="M10.3 19a1.9 1.9 0 0 0 3.4 0" />
  </svg>
);

export const IconChevronDown = (p) => (
  <svg {...base(p)} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconArrowRight = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const IconArrowUp = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M12 19V5" />
    <path d="m6 11 6-6 6 6" />
  </svg>
);

export const IconArrowDown = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M12 5v14" />
    <path d="m18 13-6 6-6-6" />
  </svg>
);

export const IconCheck = (p) => (
  <svg {...base(p)} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const IconClock = (p) => (
  <svg {...base(p)} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const IconPlus = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconMinus = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M5 12h14" />
  </svg>
);

export const IconLocate = (p) => (
  <svg {...base(p)} {...p}>
    <circle cx="12" cy="12" r="2.6" />
    <path d="M12 3v2.6M12 18.4V21M3 12h2.6M18.4 12H21" />
  </svg>
);

export const IconCamera = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M4 8.5a1.5 1.5 0 0 1 1.5-1.5h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18Z" />
    <circle cx="12" cy="13" r="3.4" />
  </svg>
);

export const IconUsers = (p) => (
  <svg {...base(p)} {...p}>
    <circle cx="9" cy="8.5" r="3" />
    <path d="M3.5 19c.6-3 2.7-4.6 5.5-4.6s4.9 1.6 5.5 4.6" />
    <circle cx="17" cy="9.5" r="2.3" />
    <path d="M15.7 14.7c2.1.3 3.6 1.7 4 4.3" />
  </svg>
);
