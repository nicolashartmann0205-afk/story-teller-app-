"use client";

import { useState, useEffect, useCallback } from "react";
import { updateScene, generateSceneDraftAction, analyzeShowDontTellAction, suggestSensoryDetailsAction } from "../actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles, AlertCircle, Check, Eye, Target, MapPin, Heart, Lightbulb } from "lucide-react";

// Types derived from schema/usage
interface MovieTimeAction {
  where: string;
  what: string;
  next: string;
  sensory_details: string[];
}

interface MovieTimeEmotion {
  characters: string;
  stakes: string;
  tone: string;
  internal_feeling?: string;
  external_show?: string;
  audience_feeling?: string;
}

interface MovieTimeMeaning {
  change: string;
  significance: string;
  takeaway: string;
  purposes: string[];
}

interface Scene {
  id: string;
  storyId: string;
  title: string;
  order?: number;
  movieTimeAction: MovieTimeAction | unknown;
  movieTimeEmotion: MovieTimeEmotion | unknown;
  movieTimeMeaning: MovieTimeMeaning | unknown;
  sceneContent: string | null;
  completenessStatus: string | null;
  showTellScore: number | null;
  lastFeedback: any;
}

export default function SceneEditor({ scene, storyId }: { scene: any; storyId: string }) {
  const router = useRouter();
  const [localScene, setLocalScene] = useState<Scene>(scene);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<any>(scene.lastFeedback);
  const [activeTab, setActiveTab] = useState<'framework' | 'draft'>('framework');

  // Helper to safely get nested properties
  const getAction = () => (localScene.movieTimeAction as MovieTimeAction) || { where: "", what: "", next: "", sensory_details: [] };
  const getEmotion = () => (localScene.movieTimeEmotion as MovieTimeEmotion) || { characters: "", stakes: "", tone: "neutral" };
  const getMeaning = () => (localScene.movieTimeMeaning as MovieTimeMeaning) || { change: "", significance: "", takeaway: "", purposes: [] };

  const handleUpdate = useCallback(async (updates: Partial<Scene>) => {
    setLocalScene(prev => ({ ...prev, ...updates }));
    setIsSaving(true);
    try {
      await updateScene(scene.id, storyId, updates);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  }, [scene.id, storyId]);

  // Debounced save for text fields
  useEffect(() => {
    const timer = setTimeout(() => {
       // Logic handled in onChange handlers directly calling handleUpdate mostly, 
       // but for text areas we might want to debounce. 
       // For simplicity in this v1, I'll trigger save onBlur or specific actions, 
       // or use a separate debounced effect if needed.
       // Let's rely on onBlur for text areas to avoid too many DB calls.
    }, 1000);
    return () => clearTimeout(timer);
  }, [localScene]);

  const updateAction = (field: keyof MovieTimeAction, value: any) => {
    const current = getAction();
    handleUpdate({ movieTimeAction: { ...current, [field]: value } });
  };

  const updateEmotion = (field: keyof MovieTimeEmotion, value: any) => {
    const current = getEmotion();
    handleUpdate({ movieTimeEmotion: { ...current, [field]: value } });
  };

  const updateMeaning = (field: keyof MovieTimeMeaning, value: any) => {
    const current = getMeaning();
    handleUpdate({ movieTimeMeaning: { ...current, [field]: value } });
  };

  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    try {
      const draft = await generateSceneDraftAction({
        movieTimeAction: getAction(),
        movieTimeEmotion: getEmotion(),
        movieTimeMeaning: getMeaning()
      }, storyId);
      
      handleUpdate({ sceneContent: draft, completenessStatus: 'drafted' });
      setActiveTab('draft');
    } catch (error) {
      alert("Failed to generate draft. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!localScene.sceneContent) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeShowDontTellAction(localScene.sceneContent);
      setFeedback(result);
      handleUpdate({ lastFeedback: result, showTellScore: result.score });
    } catch (error) {
      alert("Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSuggestSensory = async () => {
      const actionData = getAction();
      if (!actionData.where || !actionData.what) {
          alert("Please fill in Where and What is happening first.");
          return;
      }
      try {
          const suggestions = await suggestSensoryDetailsAction(actionData.where, actionData.what);
          updateAction('sensory_details', [...(actionData.sensory_details || []), ...suggestions]);
      } catch (e) {
          console.error(e);
      }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={`/stories/${storyId}/scenes`} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex flex-col">
               <span className="text-xs font-mono text-zinc-500">Scene {localScene.order || "?"}</span>
               <input 
                 value={localScene.title}
                 onChange={(e) => setLocalScene(prev => ({ ...prev, title: e.target.value }))}
                 onBlur={(e) => handleUpdate({ title: e.target.value })}
                 className="font-bold text-lg bg-transparent border-none focus:ring-0 p-0 text-zinc-900 dark:text-zinc-100"
               />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-400">
              {isSaving ? "Saving..." : lastSaved ? "Saved" : ""}
            </span>
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                <button 
                    onClick={() => setActiveTab('framework')}
                    className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${activeTab === 'framework' ? 'bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900'}`}
                >
                    Framework
                </button>
                <button 
                    onClick={() => setActiveTab('draft')}
                    className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${activeTab === 'draft' ? 'bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900'}`}
                >
                    Draft
                </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'framework' ? (
            <div className="grid gap-8">
                {/* ACTION SECTION */}
                <section className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4 text-blue-700 dark:text-blue-300">
                        <MapPin className="w-5 h-5" />
                        <h2 className="font-bold text-xl">ACTION</h2>
                        <span className="text-sm opacity-70 ml-2">Show, don't just tell</span>
                    </div>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Where are we?</label>
                            <input 
                                className="w-full rounded-md border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2"
                                placeholder="A cramped coffee shop in downtown Seattle..."
                                value={getAction().where}
                                onChange={(e) => updateAction('where', e.target.value)}
                                onBlur={(e) => updateAction('where', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">What is happening?</label>
                            <textarea 
                                className="w-full rounded-md border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 min-h-[100px]"
                                placeholder="Sarah slides the laptop across the table..."
                                value={getAction().what}
                                onChange={(e) => updateAction('what', e.target.value)}
                                onBlur={(e) => updateAction('what', e.target.value)}
                            />
                        </div>
                        <div>
                             <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Sensory Details</label>
                                <button onClick={handleSuggestSensory} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Auto-suggest
                                </button>
                             </div>
                             <div className="flex flex-wrap gap-2 mb-2">
                                {getAction().sensory_details?.map((detail, i) => (
                                    <span key={i} className="bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-2">
                                        {detail}
                                        <button onClick={() => {
                                            const newDetails = getAction().sensory_details.filter((_, idx) => idx !== i);
                                            updateAction('sensory_details', newDetails);
                                        }} className="text-zinc-400 hover:text-red-500">×</button>
                                    </span>
                                ))}
                             </div>
                             <input 
                                className="w-full rounded-md border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
                                placeholder="Add a sensory detail (press Enter)"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const val = e.currentTarget.value.trim();
                                        if (val) {
                                            updateAction('sensory_details', [...(getAction().sensory_details || []), val]);
                                            e.currentTarget.value = "";
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </section>

                {/* EMOTION SECTION */}
                <section className="bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4 text-red-700 dark:text-red-300">
                        <Heart className="w-5 h-5" />
                        <h2 className="font-bold text-xl">EMOTION</h2>
                        <span className="text-sm opacity-70 ml-2">Connect to feelings</span>
                    </div>
                    <div className="grid gap-4">
                         <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Who is involved?</label>
                            <input 
                                className="w-full rounded-md border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2"
                                placeholder="Sarah, Marcus..."
                                value={getEmotion().characters}
                                onChange={(e) => updateEmotion('characters', e.target.value)}
                                onBlur={(e) => updateEmotion('characters', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">What is at stake?</label>
                            <textarea 
                                className="w-full rounded-md border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 min-h-[80px]"
                                placeholder="The company's future, their friendship..."
                                value={getEmotion().stakes}
                                onChange={(e) => updateEmotion('stakes', e.target.value)}
                                onBlur={(e) => updateEmotion('stakes', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Emotional Tone</label>
                            <div className="flex flex-wrap gap-2">
                                {['Joy', 'Fear', 'Anger', 'Sadness', 'Surprise', 'Disgust', 'Trust', 'Anticipation', 'Neutral'].map(tone => (
                                    <button 
                                        key={tone}
                                        onClick={() => updateEmotion('tone', tone)}
                                        className={`px-3 py-1 rounded-full text-sm border ${getEmotion().tone === tone ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-red-300'}`}
                                    >
                                        {tone}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* MEANING SECTION */}
                <section className="bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4 text-green-700 dark:text-green-300">
                        <Lightbulb className="w-5 h-5" />
                        <h2 className="font-bold text-xl">MEANING</h2>
                        <span className="text-sm opacity-70 ml-2">What's the point?</span>
                    </div>
                     <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">What changed?</label>
                            <textarea 
                                className="w-full rounded-md border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 min-h-[80px]"
                                placeholder="Sarah realized she had to decide alone..."
                                value={getMeaning().change}
                                onChange={(e) => updateMeaning('change', e.target.value)}
                                onBlur={(e) => updateMeaning('change', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Why does this matter? (Takeaway)</label>
                            <textarea 
                                className="w-full rounded-md border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 min-h-[80px]"
                                placeholder="Sometimes the hardest truth is admitting..."
                                value={getMeaning().takeaway}
                                onChange={(e) => updateMeaning('takeaway', e.target.value)}
                                onBlur={(e) => updateMeaning('takeaway', e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                <div className="flex justify-center pt-8">
                    <button 
                        onClick={handleGenerateDraft}
                        disabled={isGenerating}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Generating Scene...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Generate Scene Draft
                            </>
                        )}
                    </button>
                </div>
            </div>
        ) : (
            <div className="grid gap-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm min-h-[500px]">
                    <textarea 
                        className="w-full h-full min-h-[500px] resize-none border-none focus:ring-0 text-lg leading-relaxed bg-transparent text-zinc-800 dark:text-zinc-200 font-serif"
                        placeholder="Your scene draft will appear here..."
                        value={localScene.sceneContent || ""}
                        onChange={(e) => {
                            setLocalScene(prev => ({ ...prev, sceneContent: e.target.value }));
                        }}
                        onBlur={(e) => handleUpdate({ sceneContent: e.target.value })}
                    />
                </div>

                <div className="flex justify-between items-start">
                    <button 
                         onClick={handleAnalyze}
                         disabled={isAnalyzing || !localScene.sceneContent}
                         className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium px-4 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 disabled:opacity-50"
                    >
                        <Target className="w-4 h-4" />
                        {isAnalyzing ? "Analyzing..." : "Get Show Don't Tell Feedback"}
                    </button>
                    
                    {feedback && (
                        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 max-w-md">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-sm uppercase text-zinc-500">Analysis Result</h3>
                                <span className={`font-bold px-2 py-0.5 rounded text-sm ${feedback.score >= 8 ? 'bg-green-100 text-green-800' : feedback.score >= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                    Score: {feedback.score}/10
                                </span>
                            </div>
                            <p className="text-sm font-medium mb-3">Top Priority: {feedback.topPriority}</p>
                            
                            {feedback.tellingPhrases?.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-zinc-500">Telling Phrases Found:</p>
                                    {feedback.tellingPhrases.map((phrase: any, i: number) => (
                                        <div key={i} className="text-sm bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-700">
                                            <span className="text-red-500 line-through mr-2">{phrase.original}</span>
                                            <span className="text-green-600 font-medium">{phrase.suggestion}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}







