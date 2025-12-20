export type MoralConflictID = 
  | "care_harm"
  | "fairness_cheating"
  | "liberty_oppression"
  | "authority_subversion"
  | "loyalty_betrayal"
  | "purity_degradation";

export type MoralComplexity = "simple" | "two_rights" | "lesser_evil";

export interface MoralConflict {
  id: MoralConflictID;
  name: string;
  icon: string;
  color: string;
  description: string;
  coreTension: string;
  goodSide: string;
  badSide: string;
  examples: string[];
  storyApplications: string[];
  questions: string[];
}

export const moralConflicts: MoralConflict[] = [
  {
    id: "care_harm",
    name: "Care vs. Harm",
    icon: "❤️",
    color: "pink",
    description: "Stories about compassion, protection, preventing cruelty, and alleviating suffering.",
    coreTension: "Protecting others from suffering versus causing pain or neglect",
    goodSide: "Care, compassion, nurturing, protection",
    badSide: "Harm, cruelty, neglect, causing suffering",
    examples: [
      "Healthcare access and medical ethics",
      "Animal welfare and protection",
      "Child protection services",
      "Humanitarian aid and disaster relief"
    ],
    storyApplications: [
      "Doctor choosing between saving one patient or many",
      "Parent sacrificing career to care for child",
      "Company prioritizing worker safety over profits"
    ],
    questions: [
      "Who needs protection in your story?",
      "What harm is threatened or occurring?",
      "What sacrifice is required to provide care?"
    ]
  },
  {
    id: "fairness_cheating",
    name: "Fairness vs. Cheating",
    icon: "⚖️",
    color: "blue",
    description: "Stories about justice, equality, playing by the rules, and exposing corruption.",
    coreTension: "Justice and equality versus deception and manipulation",
    goodSide: "Fairness, justice, honesty, equal treatment",
    badSide: "Cheating, deception, fraud, exploitation",
    examples: [
      "Whistleblower exposing corporate fraud",
      "Social justice movements",
      "Legal battles for equal rights",
      "Fighting corruption and bribery"
    ],
    storyApplications: [
      "Employee exposing workplace discrimination",
      "Athlete competing clean vs. doping competitors",
      "Journalist uncovering government corruption"
    ],
    questions: [
      "What injustice exists in your story?",
      "Who is playing by the rules?",
      "What does 'fair' mean in this context?"
    ]
  },
  {
    id: "liberty_oppression",
    name: "Liberty vs. Oppression",
    icon: "🛡️",
    color: "green",
    description: "Stories about freedom, independence, breaking constraints, and resisting tyranny.",
    coreTension: "Freedom and autonomy versus domination and control",
    goodSide: "Liberty, freedom, autonomy, independence",
    badSide: "Oppression, domination, tyranny, control",
    examples: [
      "Revolution and resistance movements",
      "Civil rights and liberties",
      "Escaping abusive relationships",
      "Fighting authoritarian regimes"
    ],
    storyApplications: [
      "Citizens overthrowing dictator",
      "Employee leaving controlling company culture",
      "Artist defying censorship"
    ],
    questions: [
      "Who is being constrained?",
      "What freedom is at stake?",
      "Is the limitation justified? Who decides?"
    ]
  },
  {
    id: "authority_subversion",
    name: "Authority vs. Subversion",
    icon: "👑",
    color: "purple",
    description: "Stories about hierarchy, tradition, institutions, and challenging the status quo.",
    coreTension: "Respect for structure and tradition versus rebellion and questioning",
    goodSide: "Order, tradition, legitimate authority, respect",
    badSide: "Tyranny, unjust hierarchy, blind obedience",
    examples: [
      "Military questioning illegal orders",
      "Student challenging outdated educational system",
      "Religious reformation",
      "Corporate whistleblower vs. chain of command"
    ],
    storyApplications: [
      "Military questioning illegal orders",
      "Student challenging outdated educational system",
      "Religious reformation"
    ],
    questions: [
      "What structure or tradition is being challenged?",
      "Is the authority legitimate?",
      "Is the rebellion justified?"
    ]
  },
  {
    id: "loyalty_betrayal",
    name: "Loyalty vs. Betrayal",
    icon: "👥",
    color: "teal",
    description: "Stories about allegiance, belonging, team identity, and the cost of disloyalty.",
    coreTension: "Group commitment and solidarity versus abandoning allies",
    goodSide: "Loyalty, solidarity, belonging, commitment",
    badSide: "Betrayal, abandonment, disloyalty",
    examples: [
      "Whistleblower vs. company loyalty",
      "Family ties vs. personal values",
      "National loyalty vs. global ethics"
    ],
    storyApplications: [
      "Spy choosing country vs. friend",
      "Employee exposing company vs. colleagues",
      "Gang member leaving vs. staying loyal"
    ],
    questions: [
      "What group/person commands loyalty?",
      "What greater cause might override loyalty?",
      "What would betrayal accomplish?"
    ]
  },
  {
    id: "purity_degradation",
    name: "Purity vs. Degradation",
    icon: "✨",
    color: "amber",
    description: "Stories about sanctity, contamination, maintaining standards, and moral pollution.",
    coreTension: "Sanctity, cleanliness, and transcendence versus contamination and corruption",
    goodSide: "Purity, sanctity, cleanliness, integrity",
    badSide: "Degradation, contamination, corruption, pollution",
    examples: [
      "Environmental protection",
      "Food safety and purity",
      "Religious/spiritual sanctity",
      "Moral integrity vs. compromise"
    ],
    storyApplications: [
      "Environmental activist fighting pollution",
      "Scientist maintaining research integrity",
      "Religious figure resisting corruption"
    ],
    questions: [
      "What is being contaminated, polluted, or degraded?",
      "What purity or sanctity is being protected?",
      "Is this literal or symbolic?"
    ]
  }
];












