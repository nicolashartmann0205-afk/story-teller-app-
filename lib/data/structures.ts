
export interface StructureBeat {
  id: string;
  name: string;
  description: string;
  positionPercentage: number; // 0 to 100
  act: 1 | 2 | 3;
  required?: boolean;
  // Deep Guidance properties
  emotion?: string;
  guidance?: {
    explanation: string;
    questions: string[];
    examples: string[];
    aiPrompt?: string;
    tips?: string[];
  };
  duration?: string; // Display string like "10%"
}

export interface StoryStructure {
  id: string;
  name: string;
  description: string; // Short description
  fullDescription?: string; // Detailed description
  category: 'cycle' | 'complex' | 'template' | 'linear' | 'plot'; // Added categories
  icon?: string;
  tagline?: string;
  difficulty?: 'Simple' | 'Moderate' | 'Advanced';
  timeToDevelop?: 'Quick' | 'Medium' | 'Extended';
  bestFor?: string[];
  visualArc?: number[]; // Array of 0-100 intensity values
  acts: {
    1: { name: string; percentage: number };
    2: { name: string; percentage: number };
    3: { name: string; percentage: number };
  };
  beats: StructureBeat[];
  deepGuidance?: boolean;
}

export const structureDefinitions: Record<string, StoryStructure> = {
  "heros-journey": {
    id: "heros-journey",
    name: "Hero's Journey",
    description: "Your hero leaves the ordinary world, faces trials, and returns transformed.",
    fullDescription: "Joseph Campbell's monomyth - the universal story pattern found across cultures. Perfect for stories of profound personal change, epic narratives, and transformation journeys.",
    category: "cycle",
    icon: "🦸",
    tagline: "12-stage transformation",
    difficulty: "Advanced",
    timeToDevelop: "Extended",
    bestFor: ["Epic narratives", "Personal transformation stories", "Brand origin stories", "Leadership journeys", "Career change narratives"],
    visualArc: [20, 25, 15, 30, 40, 60, 50, 80, 90, 75, 85, 95],
    acts: {
      1: { name: "Departure", percentage: 25 },
      2: { name: "Initiation", percentage: 50 },
      3: { name: "Return", percentage: 25 },
    },
    beats: [
      { 
        id: "ordinary-world", 
        name: "Ordinary World", 
        description: "Introduce hero in normal life", 
        positionPercentage: 0, 
        act: 1, 
        required: true,
        duration: "5%",
        emotion: "Comfortable but incomplete",
        guidance: {
          explanation: "Show your character's normal life - what's comfortable but also what's missing or at risk. This creates contrast for the journey ahead.",
          questions: [
            "What does a typical day look like for your character?",
            "What's missing from their life?",
            "What potential is being wasted?",
            "What would they lose if they don't change?"
          ],
          examples: [
            "Luke Skywalker on Tatooine: bored farm boy dreaming of adventure",
            "Frodo in the Shire: peaceful but restless",
            "Your brand before the 'aha moment' that led to creation"
          ],
          aiPrompt: "Describe the starting situation in concrete, sensory details"
        }
      },
      { id: "call-to-adventure", name: "Call to Adventure", description: "Disruption of comfort", positionPercentage: 10, act: 1, required: true, duration: "5%", emotion: "Curiosity, slight unease", guidance: {
        explanation: "An event, person, or realization disrupts the status quo. The universe knocks on the door.",
        questions: ["What event changes everything?", "Who or what brings the call?", "What opportunity is presented?", "Why now?"],
        examples: ["Princess Leia's hologram message", "Gandalf arriving with a quest", "Customer problem that inspired your product"],
        aiPrompt: "What specific event disrupts the ordinary world?"
      }},
      { id: "refusal-of-call", name: "Refusal of Call", description: "Fear of change", positionPercentage: 15, act: 1, duration: "5%", emotion: "Fear, doubt, resistance", guidance: {
        explanation: "The hero is reluctant, afraid, or uncertain. This makes them relatable and shows what they must overcome.",
        questions: ["Why does your hero resist?", "What are they afraid of losing?", "What doubts do they have?"],
        examples: ["Luke: 'I can't get involved'", "Neo initially refusing the white rabbit"],
        aiPrompt: "Why is the hero reluctant to accept the call?"
      }},
      { id: "meeting-mentor", name: "Meeting the Mentor", description: "Gaining wisdom/tools", positionPercentage: 20, act: 1, required: true, duration: "10%", emotion: "Hope, preparation", guidance: {
        explanation: "Someone or something provides wisdom, training, tools, or encouragement.",
        questions: ["Who guides your hero?", "What wisdom or gift do they receive?", "How does this prepare them?"],
        examples: ["Obi-Wan giving Luke his father's lightsaber", "Morpheus training Neo"],
        aiPrompt: "Who mentors the hero and what do they provide?"
      }},
      { id: "crossing-threshold", name: "Crossing the Threshold", description: "Commitment to journey", positionPercentage: 25, act: 1, required: true, duration: "10%", emotion: "Excitement, anxiety", guidance: {
        explanation: "The hero leaves the familiar world and enters the unknown. This is the point of no return.",
        questions: ["What moment marks the full commitment?", "What does the hero leave behind?", "What new world do they enter?"],
        examples: ["Luke leaving Tatooine", "Neo choosing the red pill"],
        aiPrompt: "Describe the moment your hero crosses into the special world"
      }},
      { id: "tests-allies-enemies", name: "Tests, Allies, Enemies", description: "Learning the new world", positionPercentage: 35, act: 2, duration: "15%", emotion: "Building tension", guidance: {
        explanation: "The hero encounters obstacles, makes friends and enemies, and learns the rules of this new world.",
        questions: ["What tests does your hero face?", "Who becomes allies/enemies?", "What skills are developed?"],
        examples: ["Luke learning to use the Force", "Frodo meeting Aragorn"],
        aiPrompt: "What challenges, allies, and enemies does the hero encounter?"
      }},
      { id: "approach-cave", name: "Approach to Inmost Cave", description: "Preparing for main danger", positionPercentage: 50, act: 2, duration: "10%", emotion: "Anticipation, fear", guidance: {
        explanation: "The hero approaches the most dangerous place or the central conflict.",
        questions: ["What is the 'inmost cave'?", "How does the hero prepare?", "What doubts resurface?"],
        examples: ["Approaching the Death Star", "Journey to Mount Doom"],
        aiPrompt: "How does your hero prepare for the greatest challenge?"
      }},
      { id: "ordeal", name: "The Ordeal", description: "Major crisis/death", positionPercentage: 60, act: 2, required: true, duration: "10%", emotion: "Crisis, transformation", guidance: {
        explanation: "This is the central crisis. The hero faces their greatest fear, confronts death, and is transformed.",
        questions: ["What is the life-or-death moment?", "What does the hero fear most?", "What dies so something new can be born?"],
        examples: ["Luke facing Darth Vader", "Frodo captured by Shelob"],
        aiPrompt: "Describe the ordeal - the moment of greatest crisis"
      }},
      { id: "reward", name: "The Reward", description: "Seizing the sword", positionPercentage: 65, act: 2, duration: "10%", emotion: "Relief, achievement", guidance: {
        explanation: "Having survived the ordeal, the hero claims the reward.",
        questions: ["What does the hero gain?", "How have they changed?", "What do they now understand?"],
        examples: ["Destroying the Death Star", "Destroying the Ring"],
        aiPrompt: "What reward does the hero claim after the ordeal?"
      }},
      { id: "road-back", name: "The Road Back", description: "Chase or urgency to return", positionPercentage: 75, act: 3, duration: "10%", emotion: "Urgency, purpose", guidance: {
        explanation: "The hero must return to the ordinary world with their reward, but the journey back has its own dangers.",
        questions: ["What motivates the return?", "What obstacles remain?", "What's pulling them home?"],
        examples: ["Escaping the Death Star", "Frodo's journey back to the Shire"],
        aiPrompt: "What happens on the journey back to the ordinary world?"
      }},
      { id: "resurrection", name: "The Resurrection", description: "Final test/rebirth", positionPercentage: 90, act: 3, required: true, duration: "5%", emotion: "Triumph, sacrifice", guidance: {
        explanation: "One final test shows that the hero has truly learned the lessons of the journey.",
        questions: ["What is the final challenge?", "How does the hero prove they've changed?", "What lessons are applied?"],
        examples: ["Luke trusting the Force", "Frodo letting go of the Ring"],
        aiPrompt: "What final test proves the hero's transformation?"
      }},
      { id: "return-elixir", name: "Return with Elixir", description: "Mastery of both worlds", positionPercentage: 100, act: 3, required: true, duration: "5%", emotion: "Fulfillment, wisdom", guidance: {
        explanation: "The hero returns transformed, with something valuable to share.",
        questions: ["How has the hero changed?", "What do they bring back?", "How is the ordinary world improved?"],
        examples: ["Luke as a Jedi Knight", "Frodo writing his memoir"],
        aiPrompt: "How does the hero return transformed and what do they share?"
      }},
    ],
    deepGuidance: true
  },
  "man-in-a-hole": {
    id: "man-in-a-hole",
    name: "Man In A Hole",
    description: "Someone doing OK falls into trouble, learns something valuable, climbs back wiser.",
    fullDescription: "Kurt Vonnegut's most reliable story shape. Anyone can fall into a hole, but you can't fall out - you have to climb. This is where you show your strength and what you learned in the darkness.",
    category: "cycle",
    icon: "🕳️",
    tagline: "Fall down, find treasure, climb back up",
    difficulty: "Simple",
    timeToDevelop: "Quick",
    bestFor: ["Case studies", "Lessons learned stories", "Recovery narratives", "Business turnarounds"],
    visualArc: [60, 55, 20, 15, 25, 45, 70, 85],
    acts: {
      1: { name: "The Fall", percentage: 30 },
      2: { name: "The Climb", percentage: 40 },
      3: { name: "The Result", percentage: 30 },
    },
    beats: [
      { id: "comfort-zone", name: "Comfort Zone", description: "Normal life, but something is missing or at risk", positionPercentage: 10, act: 1, duration: "15%", emotion: "Stable but unfulfilled", guidance: {
        explanation: "This isn't paradise, but it's OK. Show what's working but also hint at vulnerability.",
        questions: ["What's your starting situation?", "What potential is being wasted?", "What warning signs exist?"],
        examples: ["Successful business pre-pandemic", "Career on autopilot"],
        aiPrompt: "Describe the comfortable but vulnerable starting point"
      }},
      { id: "trigger", name: "Trigger", description: "Something knocks you down into the hole", positionPercentage: 25, act: 1, required: true, duration: "15%", emotion: "Shock, denial", guidance: {
        explanation: "Something goes wrong. Either bad luck or you weren't paying attention.",
        questions: ["What event changes everything?", "Was it bad luck or a blind spot?", "What do you lose?"],
        examples: ["Losing a major client", "Health crisis"],
        aiPrompt: "What specific event knocks the protagonist down?"
      }},
      { id: "crisis-hole", name: "Crisis (The Hole)", description: "You're down in the darkness, but treasure awaits", positionPercentage: 50, act: 2, required: true, duration: "30%", emotion: "Despair turning to discovery", guidance: {
        explanation: "This is the lowest point. But in stories, we find treasure in the dark - this is where the real learning happens.",
        questions: ["What's the lowest point?", "What treasure do you find in the dark?", "What do you learn about yourself?"],
        examples: ["Discovering what really matters", "Finding unexpected allies"],
        aiPrompt: "Describe the rock bottom moment and the realization found there"
      }},
      { id: "recovery", name: "Recovery", description: "Put the lessons to use and start climbing", positionPercentage: 75, act: 2, duration: "25%", emotion: "Determination, hope", guidance: {
        explanation: "You apply what you learned in the darkness. The climb is hard, but you're wiser now.",
        questions: ["How do you apply what you learned?", "Who helps you climb?", "What obstacles remain?"],
        examples: ["Pivoting business model", "Rebuilding with new priorities"],
        aiPrompt: "How does the protagonist start applying the lessons to improve?"
      }},
      { id: "better-place", name: "Better Place", description: "Older, wiser, stronger than before", positionPercentage: 100, act: 3, duration: "15%", emotion: "Pride, wisdom", guidance: {
        explanation: "You're not back where you started - you're somewhere better.",
        questions: ["How are you different now?", "What won't knock you down again?", "What wisdom do you share?"],
        examples: ["Business stronger with lessons applied", "Relationships deeper"],
        aiPrompt: "Describe the new, stronger state after the journey"
      }}
    ],
    deepGuidance: true
  },
  "three-act": {
    id: "three-act",
    name: "Three-Act Structure",
    description: "Setup, Confrontation, Resolution. The backbone of Western storytelling.",
    fullDescription: "Act 1 sets up the world and problem, Act 2 escalates conflict and complications, Act 3 resolves everything. Clear, professional, proven across millennia.",
    category: "complex",
    icon: "🎭",
    tagline: "Setup, Confrontation, Resolution",
    difficulty: "Moderate",
    timeToDevelop: "Medium",
    bestFor: ["Feature films", "Brand stories", "Long-form content", "Presentations"],
    visualArc: [20, 30, 40, 50, 60, 70, 80, 90, 70, 50, 95],
    acts: {
      1: { name: "Setup", percentage: 25 },
      2: { name: "Confrontation", percentage: 50 },
      3: { name: "Resolution", percentage: 25 },
    },
    beats: [
      { id: "exposition", name: "Exposition", description: "Introduce the world and main character", positionPercentage: 5, act: 1, duration: "10%", guidance: {
        explanation: "Introduce the world and main character.",
        questions: ["Who is the protagonist?", "What's their world like?", "What do they need?"],
        examples: ["Establishing the normal"],
        aiPrompt: "Introduce the protagonist and their world"
      }},
      { id: "inciting-incident", name: "Inciting Incident", description: "Problem introduced", positionPercentage: 12, act: 1, required: true, duration: "10%", guidance: {
        explanation: "The event that sets the story in motion.",
        questions: ["What disrupts the normal world?", "What problem arises?", "What's at stake?"],
        examples: ["A challenge or opportunity"],
        aiPrompt: "What triggers the main story problem?"
      }},
      { id: "plot-point-1", name: "First Plot Point", description: "Point of no return", positionPercentage: 25, act: 1, required: true, duration: "5%", guidance: {
        explanation: "Protagonist commits to addressing the problem.",
        questions: ["What decision launches the main story?", "What does the protagonist commit to?"],
        examples: ["Leaving home"],
        aiPrompt: "What decision locks the hero into the journey?"
      }},
      { id: "rising-action", name: "Rising Action", description: "First attempts to solve the problem", positionPercentage: 35, act: 2, duration: "20%", guidance: {
        explanation: "First attempts to solve the problem.",
        questions: ["What obstacles appear?", "What's the plan?", "What complications arise?"],
        examples: ["Testing the waters"],
        aiPrompt: "Describe the initial challenges and attempts to solve them"
      }},
      { id: "midpoint", name: "Midpoint", description: "Major shift/reversal", positionPercentage: 50, act: 2, required: true, duration: "10%", guidance: {
        explanation: "Major event that changes everything.",
        questions: ["What big revelation occurs?", "How do stakes rise?", "What new information appears?"],
        examples: ["A major twist"],
        aiPrompt: "What major event shifts the story at the halfway point?"
      }},
      { id: "plot-point-2", name: "Second Plot Point", description: "All is lost", positionPercentage: 75, act: 2, required: true, duration: "5%", guidance: {
        explanation: "All seems lost - the darkest moment.",
        questions: ["What's the lowest point?", "What does the protagonist lose?", "What forces the final confrontation?"],
        examples: ["Hitting rock bottom"],
        aiPrompt: "Describe the 'all is lost' moment"
      }},
      { id: "climax", name: "Climax", description: "Final battle", positionPercentage: 90, act: 3, required: true, duration: "10%", guidance: {
        explanation: "Final confrontation or decisive action.",
        questions: ["What's the final showdown?", "What choice do they make?", "How is conflict resolved?"],
        examples: ["The final battle"],
        aiPrompt: "Describe the final confrontation and resolution"
      }},
      { id: "resolution", name: "Resolution", description: "New normal", positionPercentage: 98, act: 3, duration: "5%", guidance: {
        explanation: "New normal, show lasting change.",
        questions: ["What's the new status quo?", "How has the protagonist changed?"],
        examples: ["Returning home changed"],
        aiPrompt: "What is the new state of the world after the climax?"
      }},
    ],
    deepGuidance: true
  },
  "story-spine": {
    id: "story-spine",
    name: "Story Spine",
    description: "Pixar's go-to structure for story development. Fill-in-the-blank template.",
    fullDescription: "A simple template that forces narrative logic through a series of prompts. Each prompt builds on the last, creating a complete story arc.",
    category: "template",
    icon: "📝",
    tagline: "Fill-in-the-blank story template",
    difficulty: "Simple",
    timeToDevelop: "Quick",
    bestFor: ["Quick story drafts", "Pitches", "Teaching storytelling", "Brainstorming"],
    visualArc: [10, 20, 40, 50, 60, 80, 90, 70],
    acts: {
      1: { name: "Setup", percentage: 25 },
      2: { name: "Action", percentage: 50 },
      3: { name: "Resolution", percentage: 25 },
    },
    beats: [
      { id: "once-upon-a-time", name: "Once upon a time...", description: "Establish the normal world", positionPercentage: 0, act: 1, duration: "10%", guidance: {
        explanation: "Introduce your character and their ordinary world.",
        questions: ["Who is your character?", "What's their world like?"],
        examples: ["Once upon a time, there was a small company..."],
        aiPrompt: "Start with 'Once upon a time...'"
      }},
      { id: "every-day", name: "Every day...", description: "Show the routine", positionPercentage: 15, act: 1, duration: "10%", guidance: {
        explanation: "What's the pattern? This establishes what's about to change.",
        questions: ["What's the daily routine?", "What pattern exists?"],
        examples: ["Every day, we lost customers..."],
        aiPrompt: "Continue with 'Every day...'"
      }},
      { id: "but-one-day", name: "But one day...", description: "Inciting incident", positionPercentage: 25, act: 1, required: true, duration: "10%", guidance: {
        explanation: "What changed? What disrupted the pattern?",
        questions: ["What disrupted the routine?", "What changed everything?"],
        examples: ["But one day, our biggest client asked..."],
        aiPrompt: "Continue with 'But one day...'"
      }},
      { id: "because-of-that-1", name: "Because of that...", description: "First consequence", positionPercentage: 40, act: 2, duration: "15%", guidance: {
        explanation: "What happened as a direct result?",
        questions: ["What was the immediate consequence?", "What action did this prompt?"],
        examples: ["Because of that, we developed a solution..."],
        aiPrompt: "Continue with 'Because of that...'"
      }},
      { id: "because-of-that-2", name: "Because of that...", description: "Second consequence", positionPercentage: 60, act: 2, duration: "15%", guidance: {
        explanation: "Continue the chain of causality.",
        questions: ["What did this lead to next?"],
        examples: ["Because of that, word spread..."],
        aiPrompt: "Continue with 'Because of that...'"
      }},
      { id: "until-finally", name: "Until finally...", description: "Climax and resolution", positionPercentage: 80, act: 3, required: true, duration: "15%", guidance: {
        explanation: "How does it all resolve? What's the final outcome?",
        questions: ["What's the final outcome?", "How is everything resolved?"],
        examples: ["Until finally, we were competing..."],
        aiPrompt: "Continue with 'Until finally...'"
      }},
      { id: "and-ever-since-then", name: "And ever since then...", description: "New normal", positionPercentage: 100, act: 3, duration: "10%", guidance: {
        explanation: "Show the lasting change. What's different now?",
        questions: ["What's the new normal?", "What's the lasting impact?"],
        examples: ["And ever since then, we've grown..."],
        aiPrompt: "Finish with 'And ever since then...'"
      }},
    ],
    deepGuidance: true
  },
  "hero-guide": {
    id: "hero-guide",
    name: "Hero & Guide",
    description: "Your customer is the hero, you are the expert guide who helps them succeed.",
    fullDescription: "Position your customer as the hero of their own story, with you as the expert guide who provides wisdom, tools, and support for their transformation. Perfect for customer-centric business stories.",
    category: "linear",
    icon: "🤝",
    tagline: "You are the guide, not the hero",
    difficulty: "Simple",
    timeToDevelop: "Quick",
    bestFor: ["Marketing copy", "Brand stories", "Sales pitches", "Customer success"],
    visualArc: [30, 20, 40, 50, 60, 80, 90, 100],
    acts: {
      1: { name: "Problem", percentage: 30 },
      2: { name: "Plan", percentage: 40 },
      3: { name: "Success", percentage: 30 },
    },
    beats: [
      { id: "the-hero", name: "The Hero", description: "The person with a problem or desire", positionPercentage: 10, act: 1, duration: "10%", guidance: {
        explanation: "The hero is NOT you - it's your customer.",
        questions: ["Who is your customer?", "What do they want?"],
        examples: ["Small business owner wanting to compete"],
        aiPrompt: "Describe the customer (Hero) and their desire"
      }},
      { id: "the-problem", name: "The Problem", description: "External, internal, and philosophical villain", positionPercentage: 20, act: 1, required: true, duration: "15%", guidance: {
        explanation: "External problem, internal frustration, and why it's wrong.",
        questions: ["What practical problem exists?", "How does it make them feel?", "Why is it unjust?"],
        examples: ["Need better software / Feel overwhelmed / Chaos is wrong"],
        aiPrompt: "Describe the external, internal, and philosophical problems"
      }},
      { id: "the-guide", name: "The Guide", description: "You/your company as the expert", positionPercentage: 35, act: 2, required: true, duration: "15%", guidance: {
        explanation: "You've been where they are and know the way forward.",
        questions: ["How do you show empathy?", "What authority/credentials do you have?"],
        examples: ["We built this after facing the same challenges"],
        aiPrompt: "Introduce the Guide (you) with empathy and authority"
      }},
      { id: "the-plan", name: "The Plan", description: "Clear path forward", positionPercentage: 50, act: 2, required: true, duration: "15%", guidance: {
        explanation: "Remove confusion with simple, actionable steps.",
        questions: ["What are the 3-4 steps to success?", "How do you reduce risk?"],
        examples: ["1. Book call -> 2. Get plan -> 3. Succeed"],
        aiPrompt: "Outline the 3-4 step plan for the Hero"
      }},
      { id: "call-to-action", name: "Call to Action", description: "What they should do next", positionPercentage: 65, act: 2, required: true, duration: "10%", guidance: {
        explanation: "Direct call to action and transitional call to action.",
        questions: ["What's the ideal next step?", "What's a lower-commitment option?"],
        examples: ["Buy Now", "Download Guide"],
        aiPrompt: "State the direct Call to Action"
      }},
      { id: "stakes-success", name: "Stakes (Success)", description: "Vision of success", positionPercentage: 80, act: 3, duration: "10%", guidance: {
        explanation: "Paint a picture of how great life is when they succeed.",
        questions: ["What does success look like?", "How will they feel?"],
        examples: ["Closing deals with confidence"],
        aiPrompt: "Describe the successful outcome for the Hero"
      }},
      { id: "stakes-failure", name: "Stakes (Failure)", description: "Cost of inaction", positionPercentage: 90, act: 3, duration: "10%", guidance: {
        explanation: "Show what they'll lose if they don't take action.",
        questions: ["What happens if they don't change?", "What will they miss out on?"],
        examples: ["Continuing to lose deals"],
        aiPrompt: "Describe the consequences of failure/inaction"
      }},
      { id: "transformation", name: "Transformation", description: "From -> To identity shift", positionPercentage: 100, act: 3, duration: "15%", guidance: {
        explanation: "People buy transformations. Show the identity shift.",
        questions: ["From what identity to what identity?"],
        examples: ["From overwhelmed -> Strategic"],
        aiPrompt: "Describe the Hero's transformation (From X to Y)"
      }},
    ],
    deepGuidance: true
  },
  // Light Guidance Structures
  "rags-to-riches": {
    id: "rags-to-riches",
    name: "Rags to Riches",
    description: "Rise from low to high status.",
    category: "linear",
    icon: "📈",
    visualArc: [10, 20, 30, 50, 70, 90, 100],
    acts: { 1: { name: "Low", percentage: 30 }, 2: { name: "Rise", percentage: 40 }, 3: { name: "High", percentage: 30 } },
    beats: [{ id: "initial-wretchedness", name: "Initial Wretchedness", description: "Start low", positionPercentage: 0, act: 1 }, { id: "call-out", name: "Call Out/Luck", description: "Opportunity", positionPercentage: 20, act: 1 }, { id: "out-into-world", name: "Out into World", description: "Initial success", positionPercentage: 40, act: 2 }, { id: "central-crisis", name: "Central Crisis", description: "Threat to new status", positionPercentage: 60, act: 2 }, { id: "independence", name: "Independence", description: "True status earned", positionPercentage: 80, act: 3 }, { id: "final-union", name: "Final Union", description: "Complete success", positionPercentage: 100, act: 3 }]
  },
  "tragedy": {
    id: "tragedy",
    name: "Tragedy",
    description: "Downward spiral from success to failure due to a fatal flaw.",
    category: "linear",
    icon: "📉",
    visualArc: [90, 80, 70, 50, 30, 10, 0],
    acts: { 1: { name: "High", percentage: 30 }, 2: { name: "Slip", percentage: 40 }, 3: { name: "Fall", percentage: 30 } },
    beats: [{ id: "anticipation", name: "Anticipation", description: "Hero is incomplete but hopeful", positionPercentage: 0, act: 1 }, { id: "dream", name: "The Dream", description: "Commitment to goal", positionPercentage: 20, act: 1 }, { id: "frustration", name: "Frustration", description: "Things go wrong", positionPercentage: 40, act: 2 }, { id: "nightmare", name: "Nightmare", description: "Loss of control", positionPercentage: 60, act: 2 }, { id: "destruction", name: "Destruction", description: "Final death/loss", positionPercentage: 100, act: 3 }]
  },
  "rebirth": {
    id: "rebirth",
    name: "Rebirth",
    description: "Dark transformation into better self.",
    category: "cycle",
    icon: "🔄",
    visualArc: [40, 20, 10, 30, 50, 70, 90],
    acts: { 1: { name: "Shadow", percentage: 30 }, 2: { name: "Change", percentage: 40 }, 3: { name: "Light", percentage: 30 } },
    beats: [{ id: "falling-shadow", name: "Falling under Shadow", description: "Threat emerges", positionPercentage: 10, act: 1 }, { id: "recession", name: "Recession", description: "Shadow takes hold", positionPercentage: 30, act: 1 }, { id: "imprisonment", name: "Imprisonment", description: "Trapped by dark power", positionPercentage: 50, act: 2 }, { id: "nightmare", name: "Nightmare", description: "Triumph of dark power", positionPercentage: 70, act: 2 }, { id: "rebirth", name: "Rebirth", description: "Miraculous redemption", positionPercentage: 90, act: 3 }]
  },
  "quest": {
    id: "quest",
    name: "The Quest",
    description: "Journey toward specific goal, return home.",
    category: "linear",
    icon: "🏹",
    visualArc: [30, 40, 30, 50, 40, 80, 90],
    acts: { 1: { name: "Call", percentage: 25 }, 2: { name: "Journey", percentage: 50 }, 3: { name: "Goal", percentage: 25 } },
    beats: [{ id: "call", name: "The Call", description: "Goal established", positionPercentage: 10, act: 1 }, { id: "journey", name: "The Journey", description: "Travel and monsters", positionPercentage: 40, act: 2 }, { id: "arrival", name: "Arrival/Frustration", description: "Goal in sight but distant", positionPercentage: 60, act: 2 }, { id: "ordeal", name: "Final Ordeal", description: "Last test", positionPercentage: 80, act: 3 }, { id: "goal", name: "The Goal", description: "Treasure achieved", positionPercentage: 100, act: 3 }]
  },
  "voyage-return": {
    id: "voyage-return",
    name: "Voyage and Return",
    description: "Leave familiar, explore strange world, return transformed.",
    category: "cycle",
    icon: "⛵",
    visualArc: [30, 40, 50, 60, 40, 80, 35],
    acts: { 1: { name: "Departure", percentage: 25 }, 2: { name: "Adventure", percentage: 50 }, 3: { name: "Return", percentage: 25 } },
    beats: [{ id: "anticipation", name: "Anticipation", description: "Curiosity", positionPercentage: 10, act: 1 }, { id: "dream", name: "Dream", description: "Strange world is fascinating", positionPercentage: 30, act: 2 }, { id: "frustration", name: "Frustration", description: "Strange world becomes difficult", positionPercentage: 50, act: 2 }, { id: "nightmare", name: "Nightmare", description: "Threat to survival", positionPercentage: 70, act: 2 }, { id: "escape", name: "Thrilling Escape", description: "Return to safety", positionPercentage: 90, act: 3 }]
  },
  "comedy": {
    id: "comedy",
    name: "Comedy",
    description: "Rising tension, confusion, happy resolution.",
    category: "linear",
    icon: "😊",
    visualArc: [20, 30, 25, 40, 30, 60, 90],
    acts: { 1: { name: "Confusion", percentage: 25 }, 2: { name: "Tangle", percentage: 50 }, 3: { name: "Resolution", percentage: 25 } },
    beats: [{ id: "shadow", name: "Shadow of Confusion", description: "Initial misunderstanding", positionPercentage: 10, act: 1 }, { id: "tightening", name: "Tightening the Knot", description: "Things get worse", positionPercentage: 40, act: 2 }, { id: "clarification", name: "Clarification", description: "Truth revealed", positionPercentage: 80, act: 3 }, { id: "celebration", name: "Celebration", description: "Happy ending", positionPercentage: 100, act: 3 }]
  },
  "overcoming-monster": {
    id: "overcoming-monster",
    name: "Overcoming the Monster",
    description: "Defeat threatening force.",
    category: "plot",
    icon: "🐉",
    visualArc: [20, 40, 30, 50, 20, 90, 80],
    acts: { 1: { name: "Threat", percentage: 30 }, 2: { name: "Battle", percentage: 40 }, 3: { name: "Victory", percentage: 30 } },
    beats: [{ id: "anticipation", name: "Anticipation", description: "Monster exists but distant", positionPercentage: 10, act: 1 }, { id: "dream", name: "Dream", description: "Preparing for battle", positionPercentage: 30, act: 1 }, { id: "frustration", name: "Frustration", description: "Monster is stronger than thought", positionPercentage: 50, act: 2 }, { id: "nightmare", name: "Nightmare", description: "Final battle seems lost", positionPercentage: 70, act: 2 }, { id: "escape", name: "Miraculous Escape", description: "Death of monster", positionPercentage: 90, act: 3 }]
  }
};
