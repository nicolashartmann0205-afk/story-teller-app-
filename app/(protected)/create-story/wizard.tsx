"use client";

import { useState } from "react";
import { StoryCategory, StoryType } from "@/lib/data/storyTypes";
import { CategorySelection } from "./category-selection";
import { TypeSelection } from "./type-selection";
import { TypeDetailModal } from "./type-detail-modal";
import CreateStoryForm from "./create-story-form";
import { createStoryAction } from "./actions";

export default function CreateStoryWizard() {
  const [step, setStep] = useState<"category" | "type" | "details">("category");
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | null>(null);
  const [selectedType, setSelectedType] = useState<StoryType | null>(null);
  const [viewingType, setViewingType] = useState<StoryType | null>(null);

  const handleCategorySelect = (category: StoryCategory) => {
    setSelectedCategory(category);
    if (category === "custom") {
      // Custom flow might jump straight to details/form or have a specific UI
      // For now, let's treat custom as a type selection skip
      // But our current structure expects a type object. 
      // Let's handle custom as a special case in the form.
      // For this implementation, we'll stick to the structured types first.
      // Custom implementation can be expanded later.
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
      {step === "category" && (
        <div>
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-6">
            What kind of story do you want to tell?
          </h2>
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

      {step === "details" && selectedCategory && selectedType && (
        <CreateStoryForm 
          createStoryAction={createStoryAction} 
          selectedCategory={selectedCategory}
          selectedType={selectedType}
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

