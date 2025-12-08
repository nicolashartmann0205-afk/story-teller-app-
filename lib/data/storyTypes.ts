export type StoryCategory = "business" | "marketing" | "creative" | "personal" | "educational" | "custom";

export interface StoryType {
  id: string;
  name: string;
  description: string;
  bestFor: string;
  typicalLength: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  keyElements: string[];
  recommendedStructures: string[];
  recommendedArchetypes: string[];
  examples: string[];
}

export interface StoryCategoryData {
  id: StoryCategory;
  name: string;
  icon: string;
  color: "blue" | "orange" | "purple" | "green" | "yellow" | "gray";
  description: string;
  types: StoryType[];
}

export const storyCategories: Record<StoryCategory, StoryCategoryData> = {
  business: {
    id: "business",
    name: "Business Stories",
    icon: "💼",
    color: "blue",
    description: "Strategic narratives for professional contexts",
    types: [
      {
        id: "pitch",
        name: "Business Pitch",
        description: "Persuasive presentation of an idea or product",
        bestFor: "Fundraising, investor meetings, startup competitions",
        typicalLength: "5-10 minutes or 10-15 slides",
        difficulty: "intermediate",
        keyElements: ["Problem", "Solution", "Market", "Business Model", "Team", "Ask"],
        recommendedStructures: ["manInAHole", "herosJourney", "threeAct"],
        recommendedArchetypes: ["warrior", "explorer", "sage"],
        examples: ["Airbnb pitch deck", "Uber Series A pitch"],
      },
      {
        id: "vision",
        name: "Vision Statement",
        description: "Inspiring articulation of the future",
        bestFor: "Team alignment, company meetings, public announcements",
        typicalLength: "2-5 minutes",
        difficulty: "advanced",
        keyElements: ["Current State", "Future State", "The Gap", "The Bridge"],
        recommendedStructures: ["mountain", "sparklines"],
        recommendedArchetypes: ["magician", "ruler", "creator"],
        examples: ["Steve Jobs iPhone launch", "JFK Moon speech"],
      },
      {
        id: "case-study",
        name: "Case Study",
        description: "Evidence-based success story",
        bestFor: "Sales collateral, website proof points",
        typicalLength: "1-3 pages or 5 minutes",
        difficulty: "beginner",
        keyElements: ["Challenge", "Solution", "Results", "Testimonial"],
        recommendedStructures: ["problemSolution"],
        recommendedArchetypes: ["helper", "sage"],
        examples: ["Salesforce customer stories", "HubSpot case studies"],
      },
      {
        id: "presentation",
        name: "Business Presentation",
        description: "Structured delivery of information or strategy",
        bestFor: "Internal updates, client meetings, conferences",
        typicalLength: "15-30 minutes",
        difficulty: "intermediate",
        keyElements: ["Context", "Insight", "Data", "Implication", "Next Steps"],
        recommendedStructures: ["whatIs", "report"],
        recommendedArchetypes: ["sage", "ruler"],
        examples: ["Quarterly Business Review", "Strategy Rollout"],
      }
    ],
  },
  marketing: {
    id: "marketing",
    name: "Marketing Stories",
    icon: "🚀",
    color: "orange",
    description: "Campaigns and brand narratives to drive action",
    types: [
      {
        id: "brand-story",
        name: "Brand Story",
        description: "The foundational narrative of why you exist",
        bestFor: "About Us pages, brand books, onboarding",
        typicalLength: "Medium form",
        difficulty: "advanced",
        keyElements: ["Origin", "Purpose", "Values", "Impact"],
        recommendedStructures: ["herosJourney", "goldenCircle"],
        recommendedArchetypes: ["hero", "creator", "caregiver"],
        examples: ["Nike's origin", "Patagonia's mission"],
      },
      {
        id: "product-launch",
        name: "Product Launch",
        description: "Exciting introduction of something new",
        bestFor: "Email campaigns, social media, press releases",
        typicalLength: "Short to Medium",
        difficulty: "intermediate",
        keyElements: ["Hook", "Problem", "Solution", "Features", "CTA"],
        recommendedStructures: ["aida", "pas"],
        recommendedArchetypes: ["magician", "explorer"],
        examples: ["Apple product videos", "Tesla reveals"],
      },
      {
        id: "customer-story",
        name: "Customer Success Story",
        description: "Narrative focused on a customer's journey with your product",
        bestFor: "Blog posts, sales enablement, newsletters",
        typicalLength: "500-1000 words",
        difficulty: "beginner",
        keyElements: ["Customer Profile", "Before State", "Turning Point", "After State"],
        recommendedStructures: ["beforeAfterBridge", "testimonials"],
        recommendedArchetypes: ["everyman", "hero"],
        examples: ["Slack customer stories", "Shopify user spotlights"],
      },
      {
        id: "campaign",
        name: "Marketing Campaign",
        description: "Series of connected stories for a promotion",
        bestFor: "Social media series, email sequences",
        typicalLength: "Variable (series)",
        difficulty: "advanced",
        keyElements: ["Theme", "Touchpoints", "Progression", "Call to Action"],
        recommendedStructures: ["soapOpera", "openLoops"],
        recommendedArchetypes: ["jester", "lover", "outlaw"],
        examples: ["Old Spice 'The Man Your Man Could Smell Like'", "Dove 'Real Beauty'"],
      }
    ],
  },
  creative: {
    id: "creative",
    name: "Creative Stories",
    icon: "🎨",
    color: "purple",
    description: "Fiction and artistic expressions",
    types: [
      {
        id: "short-story",
        name: "Short Story",
        description: "A contained narrative with a single effect",
        bestFor: "Entertainment, literary magazines, anthologies",
        typicalLength: "1,000 - 7,500 words",
        difficulty: "intermediate",
        keyElements: ["Character", "Setting", "Plot", "Conflict", "Theme"],
        recommendedStructures: ["freytagsPyramid", "kishotenketsu"],
        recommendedArchetypes: ["everyman", "hero", "rebel"],
        examples: ["The Lottery", "Hills Like White Elephants"],
      },
      {
        id: "novel",
        name: "Novel / Novella",
        description: "Extended fictional narrative exploring complex themes",
        bestFor: "Books, e-books, serialization",
        typicalLength: "40,000+ words",
        difficulty: "advanced",
        keyElements: ["Protagonist", "Antagonist", "Subplots", "World Building", "Climax"],
        recommendedStructures: ["saveTheCat", "threeAct", "sevenPoint"],
        recommendedArchetypes: ["hero", "explorer", "creator", "ruler"],
        examples: ["Harry Potter", "The Great Gatsby"],
      },
      {
        id: "screenplay",
        name: "Screenplay / Script",
        description: "Visual storytelling blueprint for film or TV",
        bestFor: "Movies, short films, TV pilots",
        typicalLength: "90-120 pages (feature)",
        difficulty: "advanced",
        keyElements: ["Scene Headings", "Action", "Dialogue", "Visuals"],
        recommendedStructures: ["threeAct", "sequence"],
        recommendedArchetypes: ["hero", "jester", "lover"],
        examples: ["The Godfather script", "Pulp Fiction script"],
      },
      {
        id: "memoir",
        name: "Memoir / Creative Non-Fiction",
        description: "True story told with literary techniques",
        bestFor: "Books, essays, personal blogs",
        typicalLength: "Variable",
        difficulty: "intermediate",
        keyElements: ["Truth", "Perspective", "Reflection", "Narrative Arc"],
        recommendedStructures: ["narrativeArc", "vignettes"],
        recommendedArchetypes: ["sage", "explorer"],
        examples: ["Eat, Pray, Love", "Educated"],
      }
    ],
  },
  personal: {
    id: "personal",
    name: "Personal Stories",
    icon: "🗣️",
    color: "green",
    description: "Speeches, toasts, and personal narratives",
    types: [
      {
        id: "speech",
        name: "Speech / Keynote",
        description: "Spoken address to an audience",
        bestFor: "Conferences, weddings, graduations",
        typicalLength: "10-45 minutes",
        difficulty: "intermediate",
        keyElements: ["Opening Hook", "Core Message", "Supporting Stories", "Call to Action"],
        recommendedStructures: ["nancyDuarteSparkline", "monomyth"],
        recommendedArchetypes: ["sage", "ruler", "jester"],
        examples: ["I Have a Dream", "This is Water"],
      },
      {
        id: "toast",
        name: "Wedding / Event Toast",
        description: "Short, celebratory speech honoring someone",
        bestFor: "Weddings, retirements, birthdays",
        typicalLength: "3-5 minutes",
        difficulty: "beginner",
        keyElements: ["Hook", "Connection", "Story", "Wish"],
        recommendedStructures: ["pastPresentFuture", "starStructure"],
        recommendedArchetypes: ["jester", "lover", "companion"],
        examples: ["Best Man speeches", "Retirement toasts"],
      },
      {
        id: "personal-narrative",
        name: "Personal Narrative",
        description: "Story about a significant life event",
        bestFor: "Interviews, college essays, social conversations",
        typicalLength: "5-10 minutes (spoken)",
        difficulty: "beginner",
        keyElements: ["Context", "Action", "Result", "Meaning"],
        recommendedStructures: ["star", "mountain"],
        recommendedArchetypes: ["everyman", "innocent"],
        examples: ["The Moth stories", "Job interview 'Tell me about a time...'"],
      },
      {
        id: "biography",
        name: "Biography / Tribute",
        description: "The story of another person's life",
        bestFor: "Eulogies, profiles, articles",
        typicalLength: "Variable",
        difficulty: "intermediate",
        keyElements: ["Chronology", "Theme", "Legacy", "Anecdotes"],
        recommendedStructures: ["chronological", "thematic"],
        recommendedArchetypes: ["hero", "caregiver"],
        examples: ["Steve Jobs biography", "Obituaries"],
      }
    ],
  },
  educational: {
    id: "educational",
    name: "Educational Stories",
    icon: "📚",
    color: "yellow",
    description: "Lessons and tutorials wrapped in narrative",
    types: [
      {
        id: "lesson",
        name: "Lesson / Tutorial",
        description: "Teaching a specific concept or skill",
        bestFor: "Classrooms, online courses, workshops",
        typicalLength: "5-20 minutes",
        difficulty: "beginner",
        keyElements: ["Learning Objective", "Analogy", "Demonstration", "Practice"],
        recommendedStructures: ["wholePartWhole", "problemSolution"],
        recommendedArchetypes: ["sage", "mentor"],
        examples: ["Khan Academy videos", "TED-Ed"],
      },
      {
        id: "explainer",
        name: "Explanation / How-To",
        description: "Clarifying a complex topic simply",
        bestFor: "YouTube videos, documentation, FAQs",
        typicalLength: "2-10 minutes",
        difficulty: "beginner",
        keyElements: ["Hook", "Concept", "Analogy", "Application"],
        recommendedStructures: ["whatWhyHow", "invertedPyramid"],
        recommendedArchetypes: ["sage", "magician"],
        examples: ["Kurzgesagt videos", "Vox explainers"],
      },
      {
        id: "educational-case-study",
        name: "Academic Case Study",
        description: "Detailed analysis of a real-world scenario for learning",
        bestFor: "Business schools, medical training, research",
        typicalLength: "Long form",
        difficulty: "advanced",
        keyElements: ["Background", "Dilemma", "Analysis", "Outcome"],
        recommendedStructures: ["scientificMethod", "socratic"],
        recommendedArchetypes: ["sage", "detective"],
        examples: ["HBR Case Studies", "Medical rounds"],
      }
    ],
  },
  custom: {
    id: "custom",
    name: "Custom Story",
    icon: "✨",
    color: "gray",
    description: "Create something unique",
    types: [],
  },
};
