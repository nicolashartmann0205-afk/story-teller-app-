"use client";
import { useReview } from "./review-context";

export function CompletenessChecker() {
    const { story, scenes } = useReview();
    
    const checks = [
        { label: "Story Concept", valid: !!story.hooks, weight: 10 },
        { label: "Character Archetype", valid: !!story.character, weight: 20 },
        { label: "Structure Selection", valid: !!story.structure, weight: 20 },
        { label: "Moral Conflict", valid: !!story.moralData, weight: 10 },
        { label: "Scenes Planned", valid: scenes.length > 0, weight: 40 },
    ];

    const progress = checks.reduce((acc, check) => acc + (check.valid ? check.weight : 0), 0);

    return (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <h3 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Story Completeness</h3>
            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4">
                <div 
                    className="h-full bg-indigo-600 transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="space-y-2">
                {checks.map((check, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <span className={check.valid ? "text-green-500" : "text-zinc-300 dark:text-zinc-700"}>
                            {check.valid ? "✓" : "○"}
                        </span>
                        <span className={check.valid ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-500 dark:text-zinc-600"}>
                            {check.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}


