export interface ServiceItem {
  id: string;
  label: string;
  icon: string;
}

export interface WorkItem {
  id: string;
  title: string;
  text: string;
  image: string;
  tags: string[];
}

export const DEFAULT_SERVICES_KICKER = "Our Services";
export const DEFAULT_SERVICES_HEADING =
  "We aim to provide solutions for businesses worldwide.";
export const DEFAULT_SERVICES_MORE = 4;
export const DEFAULT_WORK_HEADING = "Selected work!";
export const DEFAULT_WORK_SUBTEXT =
  "A selection of work we’re proud to have created with incredible companies.";

/** Icon names the admin can pick for a service. */
export const SERVICE_ICONS = [
  "Code2",
  "Smartphone",
  "Bot",
  "PenTool",
  "Palette",
  "Gem",
  "Megaphone",
  "Globe",
  "Cloud",
  "Database",
  "LineChart",
  "ShieldCheck",
  "Search",
  "UsersRound",
] as const;