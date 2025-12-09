import React, { useState } from 'react';
import { StoryStructure } from '@/lib/data/structures';
import StructureCard from './StructureCard';

interface StructureGridProps {
  structures: StoryStructure[];
  onSelect: (structure: StoryStructure) => void;
  onLearnMore: (structure: StoryStructure) => void;
  recommendations?: { primary: any; alternatives: any[] };
  filterType?: string;
}

export default function StructureGrid({ structures, onSelect, onLearnMore, recommendations, filterType }: StructureGridProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filter, setFilter] = useState(filterType || 'All');

  const sortedStructures = [...structures].sort((a, b) => {
    const isRecA = recommendations?.primary?.structureId === a.id;
    const isRecB = recommendations?.primary?.structureId === b.id;
    if (isRecA && !isRecB) return -1;
    if (!isRecA && isRecB) return 1;
    return 0;
  });

  return (
    <div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {sortedStructures.map(structure => (
           <StructureCard 
             key={structure.id} 
             structure={structure} 
             onSelect={onSelect}
             onLearnMore={onLearnMore}
             isRecommended={recommendations?.primary?.structureId === structure.id}
           />
         ))}
       </div>
    </div>
  );
}

