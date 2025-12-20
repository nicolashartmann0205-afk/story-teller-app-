"use client";

import dynamic from "next/dynamic";

const ParticleBackground = dynamic(() => import("./particle-background"), {
  ssr: false,
});

export default function ClientParticleBackground() {
  return <ParticleBackground />;
}


