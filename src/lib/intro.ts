export interface IntroStat {
  id: string;
  value: number;
  label: string;
}

export const DEFAULT_INTRO_KICKER = "We are…";
export const DEFAULT_INTRO_HEADING =
  "A company with a simple conviction: technology should bring order, not chaos. We believe that the digital spaces we build should be clean, purposeful, and intuitive, freeing you to focus on what matters most-growing your business and serving your community.";
export const DEFAULT_INTRO_STATS: IntroStat[] = [
  { id: "s1", value: 100, label: "Digital Ideas" },
  { id: "s2", value: 6, label: "Core Services" },
  { id: "s3", value: 52, label: "Solutions" },
  { id: "s4", value: 14, label: "Industries" },
];