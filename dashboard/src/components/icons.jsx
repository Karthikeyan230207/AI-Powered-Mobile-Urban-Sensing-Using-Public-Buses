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

export const IconRefresh = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 4v4h-4" />
  </svg>
);

export const IconTrash = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6.5 7 7.5 20a1.5 1.5 0 0 0 1.5 1.3h6a1.5 1.5 0 0 0 1.5-1.3L17.5 7" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const IconLayers = (p) => (
  <svg {...base(p)} {...p}>
    <path d="m12 2 10 5-10 5-10-5Z" />
    <path d="m2 12 10 5 10-5" />
    <path d="m2 17 10 5 10-5" />
  </svg>
);

export const IconMaximize = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
);

export const IconMinimize = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
  </svg>
);

export const IconDownload = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5" />
    <path d="M12 15V3" />
  </svg>
);

export const IconEdit = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);

export const IconMenu = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const IconX = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const IconExternalLink = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6" />
    <path d="m10 14 11-11" />
  </svg>
);

export const IconVolume = (p) => (
  <svg {...base(p)} {...p}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

export const IconVolumeX = (p) => (
  <svg {...base(p)} {...p}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

export const IconSliders = (p) => (
  <svg {...base(p)} {...p}>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

export const IconActivity = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export const IconDatabase = (p) => (
  <svg {...base(p)} {...p}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    <path d="M21 12v7" />
  </svg>
);

export const IconCheckCircle = (p) => (
  <svg {...base(p)} {...p}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

export const IconSend = (p) => (
  <svg {...base(p)} {...p}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export const IconFilter = (p) => (
  <svg {...base(p)} {...p}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const IconCopy = (p) => (
  <svg {...base(p)} {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
