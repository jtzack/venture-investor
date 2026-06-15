import type { UniverseEntry } from "./types";

/**
 * The curated watch universe: ~36 companies riding major technology shifts.
 *
 * These are STARTING IDEAS, not recommendations. Each entry's static facts
 * (sector, theme, founder-led) are hand-curated and should be re-verified —
 * CEOs change. Live financials are fetched at runtime and drive the score.
 *
 * Add your own names here; the screener will pick them up automatically.
 */
export const UNIVERSE: UniverseEntry[] = [
  // ───────────── AI Infrastructure & Semiconductors ─────────────
  {
    ticker: "NVDA",
    name: "NVIDIA",
    themes: ["AI Infrastructure", "Semiconductors"],
    founderLed: true,
    founder: "Jensen Huang",
    blurb: "GPUs and the CUDA software stack powering modern AI training and inference.",
    thesis: "Proven winner / benchmark — included so you can compare emerging names against an obvious one.",
  },
  {
    ticker: "PLTR",
    name: "Palantir Technologies",
    themes: ["AI Infrastructure", "Defense Tech"],
    founderLed: true,
    founder: "Alex Karp",
    blurb: "Data/AI operating systems for government and large enterprises.",
    thesis: "Category creator bridging defense and commercial AI; founder-led with accelerating commercial growth.",
  },
  {
    ticker: "CRWV",
    name: "CoreWeave",
    themes: ["AI Infrastructure"],
    founderLed: true,
    founder: "Michael Intrator",
    blurb: "Specialized GPU cloud built for AI workloads.",
    thesis: "Picks-and-shovels capacity for the AI buildout; explosive revenue, heavy capex to watch.",
  },
  {
    ticker: "NBIS",
    name: "Nebius Group",
    themes: ["AI Infrastructure"],
    founderLed: true,
    founder: "Arkady Volozh",
    blurb: "AI-centric cloud infrastructure provider spun out of Yandex's international assets.",
    thesis: "Founder-led AI cloud with a clean balance sheet and a large addressable compute market.",
  },
  {
    ticker: "ALAB",
    name: "Astera Labs",
    themes: ["Semiconductors", "AI Infrastructure"],
    founderLed: true,
    founder: "Jitendra Mohan",
    blurb: "Connectivity silicon (retimers, smart cabling) that wires up AI data centers.",
    thesis: "High-margin enabler of AI rack-scale interconnect; small relative to the trend it serves.",
  },
  {
    ticker: "SMCI",
    name: "Super Micro Computer",
    themes: ["AI Infrastructure"],
    founderLed: true,
    founder: "Charles Liang",
    blurb: "Builds high-density, energy-efficient AI servers and rack systems.",
    thesis: "Founder-led hardware vendor levered to AI server demand; watch margins and governance.",
  },

  // ───────────── Robotics & Automation ─────────────
  {
    ticker: "SYM",
    name: "Symbotic",
    themes: ["Robotics & Automation"],
    founderLed: true,
    founder: "Rick Cohen",
    blurb: "AI-powered warehouse automation systems for large retailers.",
    thesis: "Founder-led category leader automating the physical supply chain; large backlog.",
  },
  {
    ticker: "PATH",
    name: "UiPath",
    themes: ["Robotics & Automation", "AI Infrastructure"],
    founderLed: true,
    founder: "Daniel Dines",
    blurb: "Robotic process automation and AI agents for enterprise workflows.",
    thesis: "Founder returned as CEO; pivoting RPA toward agentic AI with software-like margins.",
  },
  {
    ticker: "SERV",
    name: "Serve Robotics",
    themes: ["Robotics & Automation"],
    founderLed: true,
    founder: "Ali Kashani",
    blurb: "Autonomous sidewalk delivery robots.",
    thesis: "Early, speculative robotics name entering a potentially huge last-mile market — high risk.",
  },

  // ───────────── Defense Tech ─────────────
  {
    ticker: "RCAT",
    name: "Red Cat Holdings",
    themes: ["Defense Tech", "Robotics & Automation"],
    founderLed: true,
    founder: "Jeff Thompson",
    blurb: "Military drone systems and components.",
    thesis: "Small-cap drone play levered to Western defense restocking; lumpy contract-driven revenue.",
  },
  {
    ticker: "KTOS",
    name: "Kratos Defense & Security",
    themes: ["Defense Tech"],
    founderLed: false,
    blurb: "Unmanned systems, drones, and propulsion for defense.",
    thesis: "Established defense-tech mid-cap riding autonomous-systems budgets.",
  },
  {
    ticker: "AVAV",
    name: "AeroVironment",
    themes: ["Defense Tech", "Robotics & Automation"],
    founderLed: false,
    blurb: "Small unmanned aircraft and loitering munitions.",
    thesis: "Pure-play tactical drone vendor with growing international demand.",
  },

  // ───────────── Energy Storage ─────────────
  {
    ticker: "AMPX",
    name: "Amprius Technologies",
    themes: ["Energy Storage"],
    founderLed: true,
    founder: "Kang Sun",
    blurb: "High-energy-density silicon-anode batteries.",
    thesis: "Founder-led battery tech targeting aviation/defense niches first; pre-scale, speculative.",
  },
  {
    ticker: "ENPH",
    name: "Enphase Energy",
    themes: ["Energy Storage"],
    founderLed: false,
    blurb: "Microinverters and home battery/storage systems.",
    thesis: "Proven solar-storage winner — benchmark for what a scaled energy name looks like.",
  },
  {
    ticker: "EOSE",
    name: "Eos Energy Enterprises",
    themes: ["Energy Storage"],
    founderLed: false,
    blurb: "Zinc-based long-duration grid storage.",
    thesis: "Non-lithium grid storage bet; binary on manufacturing ramp and cash runway.",
  },

  // ───────────── Nuclear Power ─────────────
  {
    ticker: "OKLO",
    name: "Oklo",
    themes: ["Nuclear Power"],
    founderLed: true,
    founder: "Jacob DeWitte",
    blurb: "Small fast-fission reactors sold as a power service.",
    thesis: "Founder-led SMR with a build-own-operate model; pre-revenue, regulatory-gated, high beta.",
  },
  {
    ticker: "NNE",
    name: "Nano Nuclear Energy",
    themes: ["Nuclear Power"],
    founderLed: true,
    founder: "Jay Yu",
    blurb: "Microreactor designs and nuclear fuel transportation.",
    thesis: "Very early micro-cap nuclear concept; pure optionality, treat as a lottery slice.",
  },
  {
    ticker: "SMR",
    name: "NuScale Power",
    themes: ["Nuclear Power"],
    founderLed: false,
    blurb: "Licensed small modular reactor technology.",
    thesis: "Furthest-along SMR by regulatory approval; execution and customer commitments are the test.",
  },

  // ───────────── Digital Health ─────────────
  {
    ticker: "HIMS",
    name: "Hims & Hers Health",
    themes: ["Digital Health"],
    founderLed: true,
    founder: "Andrew Dudum",
    blurb: "Direct-to-consumer telehealth and personalized treatments.",
    thesis: "Founder-led consumer-health brand with accelerating revenue and improving cash flow.",
  },
  {
    ticker: "TEM",
    name: "Tempus AI",
    themes: ["Digital Health", "AI Infrastructure"],
    founderLed: true,
    founder: "Eric Lefkofsky",
    blurb: "AI-driven precision medicine and clinical/genomic data.",
    thesis: "Founder-led health-data platform compounding a proprietary clinical dataset.",
  },
  {
    ticker: "DOCS",
    name: "Doximity",
    themes: ["Digital Health"],
    founderLed: true,
    founder: "Jeff Tangney",
    blurb: "Professional network and workflow tools for U.S. physicians.",
    thesis: "Founder-led, highly profitable network with strong margins and a clear moat.",
  },
  {
    ticker: "RXRX",
    name: "Recursion Pharmaceuticals",
    themes: ["Digital Health", "AI Infrastructure"],
    founderLed: true,
    founder: "Chris Gibson",
    blurb: "AI-driven drug discovery at industrial scale.",
    thesis: "Founder-led techbio platform; pipeline is the payoff, cash burn is the risk.",
  },

  // ───────────── Cybersecurity ─────────────
  {
    ticker: "CRWD",
    name: "CrowdStrike",
    themes: ["Cybersecurity", "AI Infrastructure"],
    founderLed: true,
    founder: "George Kurtz",
    blurb: "Cloud-native endpoint and security platform.",
    thesis: "Proven winner / benchmark — the model of a founder-led, high-margin security compounder.",
  },
  {
    ticker: "ZS",
    name: "Zscaler",
    themes: ["Cybersecurity"],
    founderLed: true,
    founder: "Jay Chaudhry",
    blurb: "Cloud-delivered zero-trust network security.",
    thesis: "Founder-led zero-trust leader with durable growth and improving free cash flow.",
  },
  {
    ticker: "S",
    name: "SentinelOne",
    themes: ["Cybersecurity", "AI Infrastructure"],
    founderLed: true,
    founder: "Tomer Weingarten",
    blurb: "Autonomous AI-based endpoint protection.",
    thesis: "Founder-led CrowdStrike challenger; faster-growing but earlier on the margin curve.",
  },
  {
    ticker: "NET",
    name: "Cloudflare",
    themes: ["Cybersecurity", "AI Infrastructure"],
    founderLed: true,
    founder: "Matthew Prince",
    blurb: "Edge network for security, performance, and developer/AI infrastructure.",
    thesis: "Founder-led platform expanding from security into edge compute and AI inference.",
  },
  {
    ticker: "RBRK",
    name: "Rubrik",
    themes: ["Cybersecurity"],
    founderLed: true,
    founder: "Bipul Sinha",
    blurb: "Data security and cyber-resilience / backup platform.",
    thesis: "Founder-led data-security growth story; watch the path from growth to profitability.",
  },

  // ───────────── Space ─────────────
  {
    ticker: "RKLB",
    name: "Rocket Lab",
    themes: ["Space", "Defense Tech"],
    founderLed: true,
    founder: "Peter Beck",
    blurb: "Small-launch rockets, satellites, and space systems.",
    thesis: "Founder-led, vertically integrating toward a larger rocket; the clearest SpaceX-adjacent public bet.",
  },
  {
    ticker: "ASTS",
    name: "AST SpaceMobile",
    themes: ["Space"],
    founderLed: true,
    founder: "Abel Avellan",
    blurb: "Satellite-to-cellphone broadband direct from space.",
    thesis: "Founder-led, huge TAM if it works; capital-intensive and execution-binary.",
  },
  {
    ticker: "LUNR",
    name: "Intuitive Machines",
    themes: ["Space", "Defense Tech"],
    founderLed: true,
    founder: "Steve Altemus",
    blurb: "Lunar landers and cislunar services for NASA and commercial customers.",
    thesis: "Founder-led space-services play on NASA's return-to-moon spending; mission-risk lumpy.",
  },
  {
    ticker: "PL",
    name: "Planet Labs",
    themes: ["Space", "Defense Tech"],
    founderLed: true,
    founder: "Will Marshall",
    blurb: "Daily Earth-imaging satellite data and analytics.",
    thesis: "Founder-led data subscription business on top of a satellite constellation.",
  },

  // ───────────── Fintech / Payments ─────────────
  {
    ticker: "AFRM",
    name: "Affirm Holdings",
    themes: ["Fintech / Payments"],
    founderLed: true,
    founder: "Max Levchin",
    blurb: "Buy-now-pay-later consumer lending and checkout.",
    thesis: "Founder-led consumer-credit network scaling toward GAAP profitability.",
  },
  {
    ticker: "TOST",
    name: "Toast",
    themes: ["Fintech / Payments"],
    founderLed: true,
    founder: "Aman Narang",
    blurb: "Point-of-sale and payments software for restaurants.",
    thesis: "Founder-led vertical SaaS+payments compounder with a large under-penetrated market.",
  },
  {
    ticker: "NU",
    name: "Nu Holdings (Nubank)",
    themes: ["Fintech / Payments"],
    founderLed: true,
    founder: "David Vélez",
    blurb: "Digital bank serving Latin America.",
    thesis: "Founder-led, profitable hyper-growth bank with a massive emerging-market runway.",
  },
  {
    ticker: "BILL",
    name: "BILL Holdings",
    themes: ["Fintech / Payments"],
    founderLed: true,
    founder: "René Lacerte",
    blurb: "Accounts-payable/receivable automation for small businesses.",
    thesis: "Founder-led SMB fintech with payment-volume optionality; growth decel is the watch item.",
  },
];

export const TICKERS = UNIVERSE.map((u) => u.ticker);

export function getEntry(ticker: string): UniverseEntry | undefined {
  return UNIVERSE.find((u) => u.ticker.toUpperCase() === ticker.toUpperCase());
}

/** All distinct themes present in the universe, in a stable display order. */
export const ALL_THEMES = Array.from(
  new Set(UNIVERSE.flatMap((u) => u.themes)),
).sort();
