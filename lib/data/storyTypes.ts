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

