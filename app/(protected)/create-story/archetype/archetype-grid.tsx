"use client";

import { useState } from "react";
import { Archetype, archetypesLibrary } from "@/lib/data/archetypes";
import { ArchetypeCard } from "./archetype-card";
import { ArchetypeDetailModal } from "./archetype-detail-modal";

interface ArchetypeGridProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ArchetypeGrid({ selectedId, onSelect }: ArchetypeGridProps) {
  const [detailArchetype, setDetailArchetype] = useState<Archetype | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const archetypes = Object.values(archetypesLibrary);

  const handleOpenDetail = (archetype: Archetype) => {
    setDetailArchetype(archetype);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDetailArchetype(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
        {archetypes.map((archetype) => (
          <ArchetypeCard
            key={archetype.id}
            archetype={archetype}
            isSelected={selectedId === archetype.id}
            onSelect={() => onSelect(archetype.id)}
            onInfo={(e) => {
              e.stopPropagation();
              handleOpenDetail(archetype);
            }}
          />
        ))}
      </div>

      <ArchetypeDetailModal
        archetype={detailArchetype}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelect={onSelect}
      />
    </>
  );
}
