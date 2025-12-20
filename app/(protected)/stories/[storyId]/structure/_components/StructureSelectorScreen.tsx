"use client";

import React, { useState } from 'react';
import { StoryStructure, structureDefinitions } from '@/lib/data/structures';
import GuidanceLevelChoice from './GuidanceLevelChoice';
import StructureGrid from './StructureGrid';
import StructureDetailModal from './StructureDetailModal';
import BeatByBeatEditor from './BeatByBeatEditor';
import AIOutlineGenerator from './AIOutlineGenerator';
import AIStructureRecommendation from './AIStructureRecommendation';
import { saveStructure } from '../actions';

interface StructureSelectorScreenProps {
  storyId: string;
  story: any; // Full story object
}

export default function StructureSelectorScreen({ storyId, story }: StructureSelectorScreenProps) {
  const [currentStructureState, setCurrentStructureState] = useState(story.structure || {});
  const [view, setView] = useState<'guidance-choice' | 'structure-list' | 'editor'>(
    story.structure?.selected ? 'editor' : (story.mode === 'quick' ? 'structure-list' : 'guidance-choice')
  );
  
  const [selectedStructure, setSelectedStructure] = useState<StoryStructure | null>(
    story.structure?.selected ? structureDefinitions[story.structure.selected.id] : null
  );
  const [modalStructure, setModalStructure] = useState<StoryStructure | null>(null);

  const availableStructures = Object.values(structureDefinitions);

  const handleGuidanceSelect = (level: 'deep' | 'light') => {
    setCurrentStructureState((prev: any) => ({ ...prev, guidanceLevel: level }));
    setView('structure-list');
  };

  const handleStructureSelect = async (structure: StoryStructure) => {
    const newState = {
      ...currentStructureState,
      selected: { id: structure.id, name: structure.name },
      selectedAt: new Date().toISOString(),
    };
    setCurrentStructureState(newState);
    setSelectedStructure(structure);
    setView('editor');
    await saveStructure(storyId, newState);
  };

  const handleEditorSave = async (data: any) => {
    const newState = {
      ...currentStructureState,
      [currentStructureState.guidanceLevel === 'light' ? 'aiOutline' : 'beats']: data,
      updatedAt: new Date().toISOString()
    };
    setCurrentStructureState(newState);
    await saveStructure(storyId, newState);
  };

  if (view === 'guidance-choice') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-zinc-900 dark:text-zinc-100">Choose Your Path</h1>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8">How much guidance do you want for your story structure?</p>
        <GuidanceLevelChoice onSelect={handleGuidanceSelect} />
      </div>
    );
  }

  if (view === 'structure-list') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Select a Structure</h1>
           {story.mode !== 'quick' && (
             <button onClick={() => setView('guidance-choice')} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">
               ← Back to Guidance Level
             </button>
           )}
        </div>

        <AIStructureRecommendation 
          storyContext={{
            storyType: story.storyType,
            audience: story.audience || 'General',
            character: story.character?.primary,
            mode: story.mode,
            purpose: story.description
          }}
          availableStructures={availableStructures}
          onSelectStructure={(id) => {
             const s = availableStructures.find(x => x.id === id);
             if (s) handleStructureSelect(s);
          }}
        />

        <StructureGrid 
          structures={availableStructures} 
          onSelect={handleStructureSelect}
          onLearnMore={setModalStructure}
        />

        <StructureDetailModal 
          structure={modalStructure}
          isOpen={!!modalStructure}
          onClose={() => setModalStructure(null)}
          onSelect={(s) => {
            setModalStructure(null);
            handleStructureSelect(s);
          }}
        />
      </div>
    );
  }

  // Editor View
  if (view === 'editor' && selectedStructure) {
     return (
       <div className="h-full flex flex-col">
         <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-4">
               <button onClick={() => setView('structure-list')} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">
                 ← Change Structure
               </button>
               <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{selectedStructure.name}</h1>
               <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-xs rounded uppercase tracking-wide text-zinc-500">
                 {currentStructureState.guidanceLevel === 'light' ? 'Light Guidance' : 'Deep Guidance'}
               </span>
            </div>
            {/* Save indicator could go here */}
         </div>

         {currentStructureState.guidanceLevel === 'light' ? (
           <AIOutlineGenerator 
             structure={selectedStructure}
             storyContext={{ ...story, structure: selectedStructure }}
             initialOutline={currentStructureState.aiOutline}
             onSave={handleEditorSave}
           />
         ) : (
           <BeatByBeatEditor 
             structure={selectedStructure}
             storyContext={{ ...story, structure: selectedStructure }}
             initialBeatsData={currentStructureState.beats}
             onSave={handleEditorSave}
           />
         )}
       </div>
     );
  }

  return <div>Loading...</div>;
}





