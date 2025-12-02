export type HookTypeID = 'unexpected' | 'knowledge' | 'story' | 'question' | 'emotional';

export interface HookType {
  id: HookTypeID;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  color: 'purple' | 'blue' | 'orange' | 'green' | 'red';
  examples: string[];
  whenToUse: string;
  strengths: string;
  considerations: string;
}

export const hookTypes: HookType[] = [
  {
    id: 'unexpected',
    name: 'Unexpected',
    icon: '🎲',
    tagline: 'Surprise and intrigue',
    description: 'Challenge assumptions, present contrarian views, or reveal surprising truths that make people stop and think.',
    color: 'purple',
    examples: [
      '"What if everything you knew about growth was wrong?"',
      '"I\'m going to tell you why your startup should fail."',
      '"The worst advice I ever got was \'follow your passion.\'"'
    ],
    whenToUse: 'When your story challenges conventional wisdom or has a surprising angle',
    strengths: 'High attention-grabbing power, creates curiosity gap',
    considerations: 'Must deliver on the promise, can feel gimmicky if overused'
  },
  {
    id: 'knowledge',
    name: 'Knowledge',
    icon: '🔍',
    tagline: 'Insider information',
    description: 'Share expertise, insider secrets, or hard-won insights that position you as an authority.',
    color: 'blue',
    examples: [
      '"After interviewing 200 failed founders, I discovered..."',
      '"There\'s a pricing strategy 9 out of 10 businesses don\'t know exists."',
      '"The hidden rule of bootstrapped success that VCs won\'t tell you."'
    ],
    whenToUse: 'When you have unique expertise or data to share',
    strengths: 'Builds credibility, promises valuable information',
    considerations: 'Must actually deliver unique insights, not common knowledge'
  },
  {
    id: 'story',
    name: 'Story',
    icon: '🎬',
    tagline: 'Drop into a scene',
    description: 'Start in the middle of action or an emotionally charged moment with vivid sensory details.',
    color: 'orange',
    examples: [
      '"It was 3 AM when I realized we had exactly $47 left in the bank."',
      '"The email landed with a subject line I\'ll never forget: \'We need to talk.\'"',
      '"Picture this: A garage. Two laptops. One big idea. Zero money."'
    ],
    whenToUse: 'When your story has a dramatic or emotionally powerful moment',
    strengths: 'Immediately engaging, creates empathy, vivid and memorable',
    considerations: 'Requires strong scene-setting skills, can feel forced'
  },
  {
    id: 'question',
    name: 'Question',
    icon: '❓',
    tagline: 'Provoke thought',
    description: 'Ask provocative questions that make the audience think or challenge their assumptions.',
    color: 'green',
    examples: [
      '"What if the thing holding you back is actually your greatest advantage?"',
      '"Have you ever wondered why the most resourced companies innovate the least?"',
      '"What would you build if failure wasn\'t an option—but neither was traditional success?"'
    ],
    whenToUse: 'When you want to engage the audience intellectually',
    strengths: 'Creates mental engagement, inclusive ("you"), thought-provoking',
    considerations: 'Must follow through with answers, can feel rhetorical'
  },
  {
    id: 'emotional',
    name: 'Emotional',
    icon: '❤️',
    tagline: 'Universal feelings',
    description: 'Connect through shared emotions and relatable human experiences.',
    color: 'red',
    examples: [
      '"You know that sinking feeling when your best idea gets rejected?"',
      '"I remember the exact moment I stopped feeling like an impostor."',
      '"There\'s nothing quite like the fear of disappointing the people who believed in you."'
    ],
    whenToUse: 'When emotional connection is central to your story',
    strengths: 'Creates immediate empathy, highly relatable, builds trust',
    considerations: 'Can feel manipulative if inauthentic, must match story tone'
  }
];


