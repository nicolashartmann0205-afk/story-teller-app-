"use client";

import { useState } from "react";
import { StoryMode } from "./mode-selection";
import { motion, AnimatePresence } from "framer-motion";

interface ModeQuestionnaireProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (mode: StoryMode) => void;
}

export function ModeQuestionnaire({ isOpen, onClose, onComplete }: ModeQuestionnaireProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  if (!isOpen) return null;

  const questions = [
    {
      text: "How much time do you have right now?",
      options: [
        { text: "Less than 30 minutes", points: 0 }, // Quick
        { text: "30-60 minutes", points: 1 }, // Neutral
        { text: "More than an hour", points: 2 }, // Comprehensive
      ],
    },
    {
      text: "What is your storytelling experience?",
      options: [
        { text: "I'm a beginner / just starting", points: 0 },
        { text: "I've written a few stories", points: 1 },
        { text: "I'm an experienced writer", points: 2 },
      ],
    },
    {
      text: "What is your goal for this session?",
      options: [
        { text: "Get a quick draft or idea down", points: 0 },
        { text: "Explore a concept in some detail", points: 1 },
        { text: "Build a complete, structured story", points: 2 },
      ],
    },
  ];

  const handleAnswer = (points: number) => {
    const newAnswers = [...answers, points];
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Calculate result
      const totalScore = newAnswers.reduce((a, b) => a + b, 0);
      // 0-2: Quick
      // 3-6: Comprehensive (Bias towards comprehensive if uncertain, or split)
      // Let's make it: < 3 -> Quick, >= 3 -> Comprehensive
      const recommendedMode: StoryMode = totalScore < 3 ? "quick" : "comprehensive";
      setRecommendation(recommendedMode);
    }
  };

  const [recommendation, setRecommendation] = useState<StoryMode | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        {!recommendation ? (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Help me choose
              </h3>
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-8">
              <div className="flex gap-2 mb-6">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      idx <= step ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  />
                ))}
              </div>

              <h4 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
                {questions[step].text}
              </h4>

              <div className="space-y-3">
                {questions[step].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option.points)}
                    className="w-full text-left p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
             <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 text-3xl">
               {recommendation === "quick" ? "⚡️" : "🧠"}
             </div>
             
             <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
               We recommend {recommendation === "quick" ? "Quick Mode" : "Comprehensive Mode"}
             </h3>
             
             <p className="text-zinc-600 dark:text-zinc-400 mb-8">
               {recommendation === "quick" 
                 ? "Based on your time and goals, a streamlined approach fits best."
                 : "You seem ready to dive deep! The comprehensive tools will help you build a richer story."}
             </p>

             <div className="flex flex-col gap-3">
               <button
                 onClick={() => onComplete(recommendation)}
                 className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-lg font-semibold hover:opacity-90"
               >
                 Start {recommendation === "quick" ? "Quick Mode" : "Comprehensive Mode"}
               </button>
               <button
                 onClick={() => onComplete(recommendation === "quick" ? "comprehensive" : "quick")}
                 className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
               >
                 No thanks, I'll choose the other one
               </button>
             </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}



