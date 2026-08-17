const iconPaths = {
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>,
  bag: <><path d="M5 8.5h14l-1 11H6l-1-11Z" /><path d="M9 9V6.5a3 3 0 0 1 6 0V9" /></>,
  sound: <><path d="M5 10h3l4-3.5v11L8 14H5v-4Z" /><path d="M15 9.5a4 4 0 0 1 0 5M17.5 7a7.5 7.5 0 0 1 0 10" /></>,
  focus: <><circle cx="12" cy="12" r="7.5" /><circle cx="12" cy="12" r="2.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
  calendar: <><rect x="4" y="5.5" width="16" height="14" rx="2" /><path d="M8 3v5M16 3v5M4 10h16M8 14l2 2 5-4" /></>,
  hand: <><path d="M7.5 12V7.5a1.5 1.5 0 0 1 3 0V11M10.5 11V5.5a1.5 1.5 0 0 1 3 0V11M13.5 11V7a1.5 1.5 0 0 1 3 0v5M16.5 12V9.5a1.5 1.5 0 0 1 3 0V15c0 4-2.8 6-6.5 6h-1c-2.5 0-4-1.2-5.2-3.2l-2.1-3.5a1.6 1.6 0 0 1 2.6-1.8L9 14" /></>,
  sensory: <><circle cx="12" cy="12" r="3" /><circle cx="5" cy="8" r="1.5" /><circle cx="19" cy="8" r="1.5" /><circle cx="7" cy="18" r="1.5" /><circle cx="17" cy="18" r="1.5" /><path d="m6.5 9 3 2M17.5 9l-3 2M8.5 17l2-2.5M15.5 17l-2-2.5" /></>,
  puzzle: <path d="M9.5 4H5a1 1 0 0 0-1 1v4.5a2.5 2.5 0 1 1 0 5V19a1 1 0 0 0 1 1h4.5a2.5 2.5 0 1 1 5 0H19a1 1 0 0 0 1-1v-4.5a2.5 2.5 0 1 0 0-5V5a1 1 0 0 0-1-1h-4.5a2.5 2.5 0 1 0-5 0Z" />,
  book: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5ZM20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z" /></>,
  heart: <path d="M20.8 5.7a5.2 5.2 0 0 0-7.4 0L12 7.1l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 22l8.8-8.9a5.2 5.2 0 0 0 0-7.4Z" />,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
  community: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M14 15a4.5 4.5 0 0 1 6.5 4" /></>,
};
const Icon = ({ name, className = "" }) => {
  return (
    <svg className={`kinora-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {iconPaths[name]}
    </svg>
  );
};
export default Icon;
