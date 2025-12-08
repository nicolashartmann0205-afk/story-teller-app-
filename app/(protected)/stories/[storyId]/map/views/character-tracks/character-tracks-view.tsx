"use client";

import { useMap } from "../../map-context";

export function CharacterTracksView() {
  const { scenes } = useMap();
  // Mock characters for visualization if none exist
  // In a real app, this would come from the database
  const characters = [
    { id: "c1", name: "Protagonist", color: "bg-blue-500" },
    { id: "c2", name: "Antagonist", color: "bg-red-500" },
    { id: "c3", name: "Mentor", color: "bg-green-500" },
  ];

  return (
    <div className="h-full w-full p-4 flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Character Tracks</h3>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Character presence per scene
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 shadow-sm overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header Row */}
          <div className="flex mb-4">
            <div className="w-32 shrink-0"></div>
            <div className="flex-1 flex gap-2">
              {scenes.map((scene) => (
                <div 
                  key={scene.id} 
                  className="flex-1 min-w-[60px] text-xs text-center text-zinc-500 dark:text-zinc-400 truncate px-1"
                  title={scene.title}
                >
                  S{scene.order}
                </div>
              ))}
            </div>
          </div>

          {/* Character Rows */}
          <div className="space-y-6">
            {characters.map((char) => (
              <div key={char.id} className="flex items-center">
                <div className="w-32 shrink-0 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${char.color}`} />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{char.name}</span>
                </div>
                
                <div className="flex-1 flex gap-2 relative">
                   {/* Track Line */}
                   <div className="absolute top-1/2 left-0 right-0 h-px bg-zinc-100 dark:bg-zinc-700 -z-10" />
                   
                   {scenes.map((scene, idx) => {
                     // Mock presence: randomly present based on hash of ids
                     const isPresent = (scene.id.charCodeAt(0) + char.id.charCodeAt(0) + idx) % 3 !== 0;
                     
                     return (
                       <div key={scene.id} className="flex-1 min-w-[60px] h-8 flex items-center justify-center">
                         {isPresent ? (
                           <div className={`w-full h-2 rounded-full ${char.color} opacity-80`} />
                         ) : (
                           <div className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                         )}
                       </div>
                     );
                   })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
        Note: Character tracking data integration is pending. This view currently shows simulated data.
      </div>
    </div>
  );
}
