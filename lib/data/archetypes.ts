export interface ArchetypeDarkSide {
  name: string;
  description: string;
}

export interface Archetype {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  fullDescription: string;
  thisIsYouWhen: string;
  youSay: string[];
  gift: string;
  values: string[];
  darkSides: {
    tooMuch: ArchetypeDarkSide;
    tooLittle: ArchetypeDarkSide;
  };
  combinations: Record<string, { name: string; description: string }>;
  examples: {
    characters: string[];
    brands: string[];
  };
  whenToUse: string;
  avoidWhen: string;
}

export const archetypesLibrary: Record<string, Archetype> = {
  ruler: {
    id: 'ruler',
    name: 'The Ruler',
    icon: '👑',
    tagline: 'Establish order',
    description: 'Take the lead. Be the commanding presence. Lay down the laws.',
    fullDescription: 'You find clarity in chaos. You\'re drawn to order, rules and security. You guide, inspire and unite people behind a higher purpose.',
    thisIsYouWhen: 'You\'re in charge. You know who\'s who and what\'s what. You spell out the rules and people look to you for leadership.',
    youSay: ['Follow me', 'This is how we do things', 'Stick to what works', 'Know your place', 'Don\'t rock the boat'],
    gift: 'Order, security, structure. A goal to follow. A plan that works.',
    values: ['order', 'security', 'mastery', 'tradition', 'loyalty', 'stability'],
    darkSides: {
      tooMuch: {
        name: 'The Tyrant',
        description: 'Dogmatic, inflexible, authoritarian, controlling, dismissive of others'
      },
      tooLittle: {
        name: 'The Abdicator',
        description: 'Weak, passive, unable to lead, lacking authority, surrenders responsibility'
      }
    },
    combinations: {
      sage: { name: 'The Judge', description: 'Wise authority, fair ruler' },
      warrior: { name: 'The Strategist', description: 'Tactical leader, military commander' },
      explorer: { name: 'The Pioneer', description: 'Visionary leader, empire builder' },
      magician: { name: 'The Shaman', description: 'Spiritual leader, transformative authority' },
      caregiver: { name: 'The Patriarch/Matriarch', description: 'Protective leader, benevolent ruler' },
      lover: { name: 'The Charmer', description: 'Charismatic ruler, beloved leader' }
    },
    examples: {
      characters: ['Winston Churchill', 'Queen Elizabeth I', 'James Bond\'s M', 'Miranda Priestly'],
      brands: ['Microsoft', 'Mercedes-Benz', 'Rolex', 'British Airways']
    },
    whenToUse: 'Stories about leadership, establishing order from chaos, organizational transformation, or maintaining tradition',
    avoidWhen: 'Your character needs to be rebellious, unconventional, or anti-authority'
  },
  caregiver: {
    id: 'caregiver',
    name: 'The Caregiver',
    icon: '🤲',
    tagline: 'Protect and nourish',
    description: 'Look after people. Provide support. Make them feel safe.',
    fullDescription: 'You sense what people need. Your purpose is to help, protect and nurture others. You give freely and build trust through compassion.',
    thisIsYouWhen: 'People lean on you. You\'re listening, supporting, protecting. You put others\' needs before your own and create safe spaces.',
    youSay: ['How do you feel?', 'I\'m listening', 'Let me help', 'You\'re not alone', 'I\'ve got you'],
    gift: 'Protection, nurturing, unconditional support. A safe haven.',
    values: ['compassion', 'empathy', 'generosity', 'protection', 'service', 'selflessness'],
    darkSides: {
      tooMuch: {
        name: 'The Nanny',
        description: 'Overprotective, smothering, enables dependency, martyrdom, guilt-tripping'
      },
      tooLittle: {
        name: 'The Neglecter',
        description: 'Cold, distant, uncaring, abandoning, selfish'
      }
    },
    combinations: {
      sage: { name: 'The Therapist', description: 'Wise counselor, healing guide' },
      warrior: { name: 'The Advocate', description: 'Fierce protector, champion of the vulnerable' },
      magician: { name: 'The Healer', description: 'Transformative nurturer, spiritual guide' },
      ruler: { name: 'The Matriarch/Patriarch', description: 'Protective leader, family head' },
      innocent: { name: 'The Angel', description: 'Pure helper, unconditional lover' }
    },
    examples: {
      characters: ['Mr. Rogers', 'Samwise Gamgee', 'Mary Poppins', 'Atticus Finch'],
      brands: ['Johnson & Johnson', 'UNICEF', 'Campbell\'s Soup', 'Volvo']
    },
    whenToUse: 'Stories about helping others, healthcare, family, mentorship, or building trust',
    avoidWhen: 'Your character needs to be self-focused, competitive, or emotionally distant'
  },
  innocent: {
    id: 'innocent',
    name: 'The Innocent',
    icon: '🌟',
    tagline: 'Pure and simple',
    description: 'See with fresh eyes. Keep it simple. Trust and hope.',
    fullDescription: 'You find wonder in the world. You believe in goodness, simplicity, and fresh starts. You see possibilities where others see problems.',
    thisIsYouWhen: 'You\'re optimistic, trusting, seeing beauty. You believe the best in people and situations. You strip away complexity to find truth.',
    youSay: ['Keep it simple', 'So much to learn', 'I believe in you', 'It\'ll be okay', 'Let\'s start fresh'],
    gift: 'Fresh start, innocence regained. Simple truth. Optimism and hope.',
    values: ['simplicity', 'trust', 'optimism', 'honesty', 'purity', 'faith', 'wonder'],
    darkSides: {
      tooMuch: {
        name: 'The Victim',
        description: 'Naive, gullible, helpless, in denial, unable to see danger'
      },
      tooLittle: {
        name: 'The Cynic',
        description: 'Jaded, suspicious, pessimistic, world-weary, lost faith'
      }
    },
    combinations: {
      warrior: { name: 'The Underdog', description: 'Unlikely hero, pure-hearted fighter' },
      companion: { name: 'The Playmate', description: 'Joyful friend, eternal child' },
      jester: { name: 'The Free Spirit', description: 'Carefree soul, spontaneous joy' },
      magician: { name: 'The Idealist', description: 'Visionary dreamer, believer in miracles' },
      sage: { name: 'The Student', description: 'Eager learner, beginner\'s mind' }
    },
    examples: {
      characters: ['Forrest Gump', 'Amélie', 'Dorothy (Wizard of Oz)', 'Ted Lasso'],
      brands: ['Dove', 'Coca-Cola', 'Innocent (smoothies)', 'Disney']
    },
    whenToUse: 'Stories about new beginnings, redemption, maintaining hope in darkness, or seeing the world differently',
    avoidWhen: 'Your story requires cynicism, worldliness, or complex moral ambiguity'
  },
  jester: {
    id: 'jester',
    name: 'The Jester',
    icon: '🎭',
    tagline: 'Play the game',
    description: 'Have fun. Break the rules. Make people laugh.',
    fullDescription: 'You lighten the mood and speak truth through humor. You see life as play and help others not take things too seriously.',
    thisIsYouWhen: 'You\'re joking, playing, performing. You break tension with laughter and speak uncomfortable truths through jest.',
    youSay: ['Come play', 'Cheer up!', 'Don\'t be so serious', 'Life\'s a game', 'Laugh it off'],
    gift: 'Playground, fun, release. Truth in jest. Permission to not take life so seriously.',
    values: ['humor', 'playfulness', 'joy', 'irreverence', 'spontaneity', 'fun'],
    darkSides: {
      tooMuch: {
        name: 'The Fool',
        description: 'Clownish, inappropriate, offensive, can\'t be serious, wastes time'
      },
      tooLittle: {
        name: 'The Bore',
        description: 'Humorless, rigid, takes everything seriously, no spontaneity'
      }
    },
    combinations: {
      warrior: { name: 'The Hacktivist', description: 'Playful rebel, disruptive force' },
      sage: { name: 'The Riddler', description: 'Wise fool, truth through puzzles' },
      rebel: { name: 'The Provocateur', description: 'Challenging authority through mockery' },
      artist: { name: 'The Entertainer', description: 'Performance artist, creative comedian' },
      companion: { name: 'The Class Clown', description: 'Social lubricant, group energizer' }
    },
    examples: {
      characters: ['The Joker (benign version)', 'Deadpool', 'Robin Williams', 'Jim Carrey characters'],
      brands: ['Old Spice', 'Dollar Shave Club', 'Ben & Jerry\'s', 'Cards Against Humanity']
    },
    whenToUse: 'Stories about breaking tension, speaking truth to power through humor, or not taking life too seriously',
    avoidWhen: 'Your story requires gravitas, seriousness, or dealing with trauma sensitively'
  },
  companion: {
    id: 'companion',
    name: 'The Companion',
    icon: '🤝',
    tagline: 'Belong and connect',
    description: 'Be part of something. Build relationships. Fit in.',
    fullDescription: 'You thrive in community. You\'re the friend everyone can count on, the team player, the one who brings people together.',
    thisIsYouWhen: 'You\'re connecting, collaborating, building friendships. You value belonging and make others feel included.',
    youSay: ['We\'re in this together', 'You belong here', 'How can I help?', 'Let\'s do this as a team', 'Nobody gets left behind'],
    gift: 'Belonging, friendship, community. Reliable support. Social connection.',
    values: ['friendship', 'loyalty', 'equality', 'collaboration', 'community', 'inclusion'],
    darkSides: {
      tooMuch: {
        name: 'The Conformist',
        description: 'People-pleasing, no individuality, afraid to stand out, loses self in group'
      },
      tooLittle: {
        name: 'The Outcast',
        description: 'Isolated, unable to connect, antisocial, rejected by community'
      }
    },
    combinations: {
      caregiver: { name: 'The Best Friend', description: 'Loyal supporter, always there' },
      warrior: { name: 'The Teammate', description: 'Reliable ally, team player' },
      innocent: { name: 'The Playmate', description: 'Fun companion, joyful friend' },
      sage: { name: 'The Mentor', description: 'Wise friend, teaching companion' }
    },
    examples: {
      characters: ['Samwise Gamgee', 'Watson', 'Chewbacca', 'Ron Weasley'],
      brands: ['IKEA', 'Budweiser', 'Airbnb', 'LinkedIn']
    },
    whenToUse: 'Stories about friendship, teamwork, finding your tribe, or the power of community',
    avoidWhen: 'Your character needs to be a lone wolf, leader, or highly individualistic'
  },
  lover: {
    id: 'lover',
    name: 'The Lover',
    icon: '❤️',
    tagline: 'Find intimacy',
    description: 'Follow your heart. Connect deeply. Inspire passion.',
    fullDescription: 'You live for connection, beauty, and passion. You create intimacy and help others experience life more deeply.',
    thisIsYouWhen: 'You\'re pursuing what you love, connecting deeply, creating beauty. You\'re passionate and help others feel alive.',
    youSay: ['Follow your heart', 'This is beautiful', 'I want you', 'Feel this', 'Life is for living'],
    gift: 'Passion, intimacy, beauty. Deep connection. Aliveness and sensuality.',
    values: ['passion', 'intimacy', 'beauty', 'devotion', 'romance', 'sensuality'],
    darkSides: {
      tooMuch: {
        name: 'The Obsessive',
        description: 'Jealous, possessive, loses identity in relationships, codependent'
      },
      tooLittle: {
        name: 'The Frigid',
        description: 'Emotionally distant, unable to love, closed off, cold'
      }
    },
    combinations: {
      artist: { name: 'The Muse', description: 'Inspiring beauty, creative passion' },
      magician: { name: 'The Enchanter', description: 'Transformative love, magical attraction' },
      ruler: { name: 'The Charmer', description: 'Charismatic leader, seductive power' },
      companion: { name: 'The Soulmate', description: 'Deep connection, perfect partner' }
    },
    examples: {
      characters: ['Romeo & Juliet', 'Noah (The Notebook)', 'Jack & Rose (Titanic)'],
      brands: ['Victoria\'s Secret', 'Chanel', 'Godiva', 'Häagen-Dazs']
    },
    whenToUse: 'Stories about romance, passion, pursuing beauty, or deep human connection',
    avoidWhen: 'Your story requires emotional distance, logic over feeling, or avoidance of intimacy'
  },
  rebel: {
    id: 'rebel',
    name: 'The Rebel',
    icon: '⚡',
    tagline: 'Break the rules',
    description: 'Challenge authority. Disrupt the status quo. Revolution.',
    fullDescription: 'You fight against what\'s wrong. You challenge the establishment and break rules that need breaking. You\'re the catalyst for change.',
    thisIsYouWhen: 'You\'re questioning authority, breaking conventions, fighting the system. You won\'t accept "that\'s how it\'s always been."',
    youSay: ['Question everything', 'The rules are wrong', 'We need change', 'Fight the power', 'Break free'],
    gift: 'Liberation, revolution, necessary disruption. Breaking what needs to break. New possibilities.',
    values: ['freedom', 'revolution', 'disruption', 'independence', 'authenticity', 'change'],
    darkSides: {
      tooMuch: {
        name: 'The Destroyer',
        description: 'Chaos agent, destructive, rebels without cause, anarchic, dangerous'
      },
      tooLittle: {
        name: 'The Sellout',
        description: 'Compromised, controlled, loses edge, becomes the establishment'
      }
    },
    combinations: {
      warrior: { name: 'The Revolutionary', description: 'Fighting for systemic change' },
      jester: { name: 'The Provocateur', description: 'Using humor to challenge power' },
      artist: { name: 'The Iconoclast', description: 'Breaking artistic conventions' },
      explorer: { name: 'The Maverick', description: 'Blazing new trails, independent path' }
    },
    examples: {
      characters: ['Katniss Everdeen', 'V (V for Vendetta)', 'Tyler Durden', 'Che Guevara'],
      brands: ['Harley-Davidson', 'Virgin', 'Diesel', 'Apple (1984)']
    },
    whenToUse: 'Stories about fighting injustice, disrupting industries, personal liberation, or challenging the status quo',
    avoidWhen: 'Your story requires respect for tradition, authority, or working within systems'
  },
  explorer: {
    id: 'explorer',
    name: 'The Explorer',
    icon: '🧭',
    tagline: 'Discover the unknown',
    description: 'Journey into new territory. Seek freedom. Find yourself.',
    fullDescription: 'You\'re driven to discover what\'s beyond the horizon. You value autonomy and authentic experience over comfort and security.',
    thisIsYouWhen: 'You\'re traveling, discovering, seeking new experiences. You feel most alive when exploring the unknown.',
    youSay: ['Let\'s see what\'s out there', 'I need to find myself', 'The journey is the destination', 'Don\'t fence me in', 'There\'s so much to discover'],
    gift: 'Freedom, discovery, autonomy. New horizons. Authentic self-discovery.',
    values: ['freedom', 'discovery', 'authenticity', 'autonomy', 'adventure', 'experience'],
    darkSides: {
      tooMuch: {
        name: 'The Wanderer',
        description: 'Aimless, can\'t commit, always running, never satisfied, lonely'
      },
      tooLittle: {
        name: 'The Prisoner',
        description: 'Trapped, confined, afraid of unknown, stuck in comfort zone'
      }
    },
    combinations: {
      warrior: { name: 'The Adventurer', description: 'Brave discoverer, conquering new territory' },
      sage: { name: 'The Scientist', description: 'Knowledge seeker, researcher' },
      rebel: { name: 'The Maverick', description: 'Unconventional pathfinder' },
      magician: { name: 'The Visionary', description: 'Seeing new possibilities' },
      ruler: { name: 'The Pioneer', description: 'Building empires in new lands' }
    },
    examples: {
      characters: ['Indiana Jones', 'Bear Grylls', 'Christopher McCandless', 'Cheryl Strayed'],
      brands: ['Jeep', 'The North Face', 'Patagonia', 'Red Bull']
    },
    whenToUse: 'Stories about self-discovery, adventure, breaking free from constraints, or pioneering new territory',
    avoidWhen: 'Your story requires stability, commitment to place/people, or embracing routine'
  },
  warrior: {
    id: 'warrior',
    name: 'The Warrior',
    icon: '⚔️',
    tagline: 'Show courage',
    description: 'Stand up and fight. Overcome obstacles. Never surrender.',
    fullDescription: 'You face challenges head-on with courage and determination. You fight for what matters and inspire others to do the same.',
    thisIsYouWhen: 'You\'re fighting, competing, overcoming obstacles. You refuse to give up and push through adversity with discipline.',
    youSay: ['Never give up', 'I can do this', 'Fight for it', 'No excuses', 'Bring it on'],
    gift: 'Courage, strength, victory. Discipline and determination. Overcoming the impossible.',
    values: ['courage', 'determination', 'strength', 'discipline', 'honor', 'victory'],
    darkSides: {
      tooMuch: {
        name: 'The Bully',
        description: 'Aggressive, ruthless, wins at all costs, tramples others, violent'
      },
      tooLittle: {
        name: 'The Coward',
        description: 'Weak, avoidant, gives up easily, lacks backbone, fearful'
      }
    },
    combinations: {
      ruler: { name: 'The Strategist', description: 'Tactical fighter, military leader' },
      caregiver: { name: 'The Advocate', description: 'Fighting for the vulnerable' },
      sage: { name: 'The Samurai', description: 'Disciplined warrior, martial philosophy' },
      explorer: { name: 'The Adventurer', description: 'Brave pathfinder, conquering unknown' },
      rebel: { name: 'The Revolutionary', description: 'Fighting oppression, freedom fighter' }
    },
    examples: {
      characters: ['Wonder Woman', 'Rocky Balboa', 'Mulan', 'William Wallace'],
      brands: ['Nike', 'Under Armour', 'FedEx', 'U.S. Marines']
    },
    whenToUse: 'Stories about overcoming adversity, competition, fighting for a cause, or physical/mental challenges',
    avoidWhen: 'Your story requires collaboration over competition, or peace over conflict'
  },
  artist: {
    id: 'artist',
    name: 'The Artist',
    icon: '🎨',
    tagline: 'Express and create',
    description: 'Free your mind. Show us a new way. Express the inexpressible.',
    fullDescription: 'You see "a world in a grain of sand." You express complex ideas through metaphor, symbol, and beauty. You teach us new ways of seeing.',
    thisIsYouWhen: 'You can\'t wait to create. You\'re captivated by beauty, lost in the creative moment. You see beneath the surface.',
    youSay: ['It\'s like...', 'Picture this', 'Look closer', 'Do you see what I mean?', 'It\'s hard to put into words, but...'],
    gift: 'A new way of seeing. Perspective, abstraction, beauty. Signs, symbols, and metaphors.',
    values: ['creativity', 'vision', 'expression', 'beauty', 'imagination', 'originality'],
    darkSides: {
      tooMuch: {
        name: 'The Poseur',
        description: 'Style over substance, irrational, impractical, pretentious, self-indulgent'
      },
      tooLittle: {
        name: 'The Pedant',
        description: 'Logical, literal, tin-eared, no imagination, misses nuance'
      }
    },
    combinations: {
      sage: { name: 'The Storyteller', description: 'Narrative wisdom, meaningful art' },
      ruler: { name: 'The Trendsetter', description: 'Cultural tastemaker, style authority' },
      jester: { name: 'The Entertainer', description: 'Performance art, joyful creation' },
      rebel: { name: 'The Iconoclast', description: 'Breaking conventions, avant-garde' },
      lover: { name: 'The Muse', description: 'Inspiring beauty, romantic artist' }
    },
    examples: {
      characters: ['Picasso', 'Frida Kahlo', 'Vincent van Gogh', 'David Bowie'],
      brands: ['Apple', 'LEGO', 'Moleskine', 'Adobe']
    },
    whenToUse: 'Stories about creativity, self-expression, seeing differently, or creating beauty from chaos',
    avoidWhen: 'Your story requires practicality, logic over emotion, or conventional thinking'
  },
  magician: {
    id: 'magician',
    name: 'The Magician',
    icon: '✨',
    tagline: 'Change and possibility',
    description: 'Attempt the impossible. Transform. Make dreams real.',
    fullDescription: 'You make jaws drop. You imagine new worlds hiding in plain sight. You show that change is possible and anything can be transformed.',
    thisIsYouWhen: 'You\'re dreaming, imagining, creating transformation. Your work makes people say: "Wow, how did you do that?"',
    youSay: ['Imagine', 'What if', 'Why not?', 'Let go of that, try this', 'It\'s a long shot but...', 'Do you see what I mean?'],
    gift: 'Wish fulfillment. Transformation from one way of being to another. New possibilities. A window into another world.',
    values: ['transformation', 'possibility', 'imagination', 'wonder', 'change', 'vision'],
    darkSides: {
      tooMuch: {
        name: 'The Illusionist',
        description: 'Snake oil salesman, sleight of hand, deceptive, promises impossible things'
      },
      tooLittle: {
        name: 'The Sceptic',
        description: 'Unimaginative, rationalist, in denial, can\'t see potential'
      }
    },
    combinations: {
      artist: { name: 'The Visionary', description: 'Creative transformer, imaginative genius' },
      ruler: { name: 'The Shaman', description: 'Spiritual leader, transformative authority' },
      warrior: { name: 'The Entrepreneur', description: 'Making impossible possible, business transformer' },
      sage: { name: 'The Alchemist', description: 'Transforming knowledge into wisdom' },
      lover: { name: 'The Enchanter', description: 'Transformative love, magical attraction' }
    },
    examples: {
      characters: ['Dumbledore', 'Mary Poppins', 'Houdini', 'Steve Jobs'],
      brands: ['Disney', 'Tesla', 'Mastercard ("priceless")', 'TED']
    },
    whenToUse: 'Stories about transformation, innovation, making the impossible possible, or creating new realities',
    avoidWhen: 'Your story requires practicality, skepticism, or acceptance of limitations'
  },
  sage: {
    id: 'sage',
    name: 'The Sage',
    icon: '🦉',
    tagline: 'Truth and wisdom',
    description: 'Seek truth. Share knowledge. Find understanding.',
    fullDescription: 'You study hard to discover how things really are. You feel grounded when you know your stuff. You share wisdom to help others understand.',
    thisIsYouWhen: 'You\'re researching, analyzing, teaching. You cut through confusion with clarity and help others see truth.',
    youSay: ['The truth is...', 'Let me explain', 'Here\'s what the data shows', 'Think about it', 'Knowledge is power'],
    gift: 'Truth, wisdom, understanding. Clarity in confusion. Expert knowledge.',
    values: ['truth', 'knowledge', 'wisdom', 'understanding', 'clarity', 'expertise'],
    darkSides: {
      tooMuch: {
        name: 'The Know-It-All',
        description: 'Condescending, dogmatic, ivory tower, out of touch, paralysis by analysis'
      },
      tooLittle: {
        name: 'The Ignorant',
        description: 'Misinformed, anti-intellectual, rejects expertise, spreads falsehoods'
      }
    },
    combinations: {
      ruler: { name: 'The Judge', description: 'Wise authority, fair decision-maker' },
      caregiver: { name: 'The Therapist', description: 'Healing through wisdom' },
      warrior: { name: 'The Samurai', description: 'Disciplined mastery, martial wisdom' },
      artist: { name: 'The Storyteller', description: 'Teaching through narrative' },
      magician: { name: 'The Alchemist', description: 'Transforming knowledge into power' }
    },
    examples: {
      characters: ['Yoda', 'Gandalf', 'Sherlock Holmes', 'Carl Sagan'],
      brands: ['Google', 'BBC', 'MIT', 'The Economist']
    },
    whenToUse: 'Stories about discovering truth, sharing knowledge, solving mysteries, or cutting through confusion with wisdom',
    avoidWhen: 'Your story requires emotional over intellectual appeal, or celebrates intuition over analysis'
  }
};

// Generate combination matrix helper
export const getCombination = (primaryId: string, secondaryId: string) => {
  if (primaryId === secondaryId) return null;
  
  const primary = archetypesLibrary[primaryId];
  if (!primary || !primary.combinations) return null;
  
  return primary.combinations[secondaryId] || null;
};











