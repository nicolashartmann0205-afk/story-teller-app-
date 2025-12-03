"use client";

import { useState } from "react";
import { StoryCategory, StoryType } from "@/lib/data/storyTypes";
import { CategorySelection } from "./category-selection";
import { TypeSelection } from "./type-selection";
import { TypeDetailModal } from "./type-detail-modal";
import CreateStoryForm from "./create-story-form";
import { createStoryAction } from "./actions";
import { ModeSelection, StoryMode } from "./mode-selection";
import { ModeQuestionnaire } from "./mode-questionnaire";

export default function CreateStoryWizard() {
  const [step, setStep] = useState<"mode" | "category" | "type" | "details">("mode");
  const [selectedMode, setSelectedMode] = useState<StoryMode | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | null>(null);
  const [selectedType, setSelectedType] = useState<StoryType | null>(null);
  const [viewingType, setViewingType] = useState<StoryType | null>(null);
  const [showModeHelp, setShowModeHelp] = useState(false);

  const handleModeSelect = (mode: StoryMode) => {
    setSelectedMode(mode);
    setStep("category");
  };

  const handleCategorySelect = (category: StoryCategory) => {
    setSelectedCategory(category);
    if (category === "custom") {
      // Custom flow might jump straight to details/form or have a specific UI
      alert("Custom story type flow coming soon! Please select a category.");
      return;
    }
    setStep("type");
  };

  const handleTypeSelect = (type: StoryType) => {
    setViewingType(type);
  };

  const handleTypeConfirm = (type: StoryType) => {
    setSelectedType(type);
    setViewingType(null);
    setStep("details");
  };

  const handleBackToMode = () => {
    setStep("mode");
    setSelectedMode(null);
  };

  const handleBackToCategories = () => {
    setStep("category");
    setSelectedCategory(null);
  };

  const handleBackToTypes = () => {
    setStep("type");
    setSelectedType(null);
  };

  return (
    <>
      {step === "mode" && (
        <div>
           <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-6">
            Choose your storytelling mode
          </h2>
          <ModeSelection 
            onSelect={handleModeSelect} 
            onHelp={() => setShowModeHelp(true)}
          />
          <ModeQuestionnaire 
            isOpen={showModeHelp}
            onClose={() => setShowModeHelp(false)}
            onComplete={(mode) => {
              setShowModeHelp(false);
              handleModeSelect(mode);
            }}
          />
        </div>
      )}

      {step === "category" && (
        <div>
           <div className="flex items-center gap-4 mb-6">
            <button onClick={handleBackToMode} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">
              ← Back to Mode
            </button>
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              What kind of story do you want to tell?
            </h2>
          </div>
          <CategorySelection onSelect={handleCategorySelect} />
        </div>
      )}

      {step === "type" && selectedCategory && (
        <TypeSelection 
          category={selectedCategory} 
          onSelect={handleTypeSelect} 
          onBack={handleBackToCategories} 
        />
      )}

      {step === "details" && selectedCategory && selectedType && selectedMode && (
        <CreateStoryForm 
          createStoryAction={createStoryAction} 
          selectedCategory={selectedCategory}
          selectedType={selectedType}
          selectedMode={selectedMode}
          onBack={handleBackToTypes}
        />
      )}

      <TypeDetailModal 
        type={viewingType} 
        isOpen={!!viewingType} 
        onClose={() => setViewingType(null)} 
        onConfirm={handleTypeConfirm} 
      />
    </>
  );
}
