import React from "react";
import { 
  Heart, Scale, Shield, Crown, Users, Sparkles, 
  BookOpen, Download, Edit, CheckCircle, AlertTriangle, XCircle, 
  Mail, Lock, User, Settings, LogOut, LayoutDashboard
} from "lucide-react";

export default function StyleGuidePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 p-8 md:p-16 space-y-16 font-sans text-zinc-900 dark:text-zinc-100">
      
      {/* Header */}
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Story Teller Design System</h1>
        <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl">
          A living guide to the typography, colors, and components used throughout the application.
          Consolidated from feature specifications.
        </p>
      </header>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      {/* Typography */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-zinc-400 uppercase tracking-wider text-sm">01. Typography</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs text-zinc-500 font-mono">Heading 1 / Bold / 36px</span>
              <h1 className="text-4xl font-bold">The quick brown fox jumps over the lazy dog</h1>
            </div>
            <div className="space-y-2">
              <span className="text-xs text-zinc-500 font-mono">Heading 2 / Semibold / 30px</span>
              <h2 className="text-3xl font-semibold">The quick brown fox jumps over the lazy dog</h2>
            </div>
            <div className="space-y-2">
              <span className="text-xs text-zinc-500 font-mono">Heading 3 / Semibold / 24px</span>
              <h3 className="text-2xl font-semibold">The quick brown fox jumps over the lazy dog</h3>
            </div>
            <div className="space-y-2">
              <span className="text-xs text-zinc-500 font-mono">Heading 4 / Medium / 20px</span>
              <h4 className="text-xl font-medium">The quick brown fox jumps over the lazy dog</h4>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs text-zinc-500 font-mono">Body / Regular / 16px</span>
              <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                Storytelling is the social and cultural activity of sharing stories, sometimes with improvisation, theatrics or embellishment. Every culture has its own stories or narratives, which are shared as a means of entertainment, education, cultural preservation or instilling moral values.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-xs text-zinc-500 font-mono">Small / Regular / 14px</span>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Used for metadata, helper text, and secondary information.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-xs text-zinc-500 font-mono">Draft Editor / Serif / 18px</span>
              <p className="font-serif text-lg leading-relaxed text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-md border border-zinc-100 dark:border-zinc-800">
                "The day the sky turned purple, I knew everything had changed." He looked up, squinting against the unnatural light, and wondered if he was the only one who remembered what blue looked like.
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      {/* Colors */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-zinc-400 uppercase tracking-wider text-sm">02. Colors</h2>

        <div className="space-y-8">
          {/* Core Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Core Brand</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <ColorCard name="Primary (Purple)" hex="#8B5CF6" bg="bg-purple-500" />
              <ColorCard name="Primary Hover" hex="#7C3AED" bg="bg-purple-600" />
              <ColorCard name="Primary Light" hex="#EDE9FE" bg="bg-purple-100" text="text-purple-900" />
              <ColorCard name="Background" hex="#FFFFFF" bg="bg-white" border />
              <ColorCard name="Dark Bg" hex="#09090B" bg="bg-zinc-950" />
              <ColorCard name="Subtle Bg" hex="#F3F4F6" bg="bg-gray-100" text="text-gray-900" />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Status & Feedback</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <ColorCard name="Success (Green)" hex="#10B981" bg="bg-emerald-500" />
              <ColorCard name="Success Light" hex="#D1FAE5" bg="bg-emerald-100" text="text-emerald-900" />
              <ColorCard name="Warning (Yellow)" hex="#F59E0B" bg="bg-amber-500" />
              <ColorCard name="Warning Light" hex="#FEF3C7" bg="bg-amber-100" text="text-amber-900" />
              <ColorCard name="Error (Red)" hex="#EF4444" bg="bg-red-500" />
              <ColorCard name="Error Light" hex="#FEE2E2" bg="bg-red-100" text="text-red-900" />
            </div>
          </div>

          {/* Emotional Arc */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Emotional Arc Mapping</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <ColorCard name="Joy" hex="#FCD34D" bg="bg-amber-300" text="text-amber-900" />
              <ColorCard name="Fear" hex="#A78BFA" bg="bg-purple-400" />
              <ColorCard name="Anger" hex="#F87171" bg="bg-red-400" />
              <ColorCard name="Sadness" hex="#60A5FA" bg="bg-blue-400" />
              <ColorCard name="Surprise" hex="#FB923C" bg="bg-orange-400" />
              <ColorCard name="Anticipation" hex="#F472B6" bg="bg-pink-400" />
              <ColorCard name="Trust" hex="#5EEAD4" bg="bg-teal-300" text="text-teal-900" />
              <ColorCard name="Disgust" hex="#86EFAC" bg="bg-green-300" text="text-green-900" />
              <ColorCard name="Neutral" hex="#9CA3AF" bg="bg-gray-400" />
            </div>
          </div>

          {/* Moral Conflict Themes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Moral Conflict Themes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <ColorCard name="Care vs Harm" hex="#EC4899" bg="bg-pink-500" />
              <ColorCard name="Fairness" hex="#3B82F6" bg="bg-blue-500" />
              <ColorCard name="Liberty" hex="#10B981" bg="bg-emerald-500" />
              <ColorCard name="Authority" hex="#8B5CF6" bg="bg-violet-500" />
              <ColorCard name="Loyalty" hex="#14B8A6" bg="bg-teal-500" />
              <ColorCard name="Purity" hex="#F59E0B" bg="bg-amber-500" />
            </div>
          </div>
        </div>
      </section>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      {/* Components */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-zinc-400 uppercase tracking-wider text-sm">03. Components</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Buttons */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Buttons</h3>
            <div className="flex flex-wrap gap-4 items-center p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <button className="h-10 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 font-medium transition-colors">
                Primary Button
              </button>
              <button className="h-10 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium transition-colors">
                Brand Action
              </button>
              <button className="h-10 px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium transition-colors">
                Secondary
              </button>
              <button className="h-10 px-4 py-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium transition-colors">
                Ghost
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Cards</h3>
            <div className="grid gap-4">
              <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h4 className="font-semibold mb-2">Standard Card</h4>
                <p className="text-zinc-500 text-sm">Used for grouping content sections or list items.</p>
              </div>
              <div className="p-6 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800/30">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Accent Card</h4>
                <p className="text-purple-700 dark:text-purple-300 text-sm">Used for highlighting featured content or specific modes.</p>
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Form Elements</h3>
            <div className="space-y-4 p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-sm">
              <div className="space-y-2">
                <label className="text-sm font-medium">Label</label>
                <input 
                  type="text" 
                  placeholder="Placeholder text..." 
                  className="w-full h-10 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Active Input</label>
                <input 
                  type="text" 
                  defaultValue="Focused state" 
                  className="w-full h-10 px-3 rounded-md border border-purple-500 bg-transparent ring-1 ring-purple-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-red-600 dark:text-red-400">Error Input</label>
                <input 
                  type="text" 
                  defaultValue="Invalid value" 
                  className="w-full h-10 px-3 rounded-md border border-red-500 bg-transparent text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-red-500">This field is required.</p>
              </div>
            </div>
          </div>

          {/* Icons */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Iconography</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              <IconBox icon={Heart} name="Heart" />
              <IconBox icon={Scale} name="Scale" />
              <IconBox icon={Shield} name="Shield" />
              <IconBox icon={Crown} name="Crown" />
              <IconBox icon={Users} name="Users" />
              <IconBox icon={Sparkles} name="Sparkles" />
              <IconBox icon={BookOpen} name="Book" />
              <IconBox icon={Download} name="Download" />
              <IconBox icon={Edit} name="Edit" />
              <IconBox icon={CheckCircle} name="Check" />
              <IconBox icon={AlertTriangle} name="Alert" />
              <IconBox icon={Mail} name="Mail" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function ColorCard({ name, hex, bg, text = "text-white", border = false }: { name: string, hex: string, bg: string, text?: string, border?: boolean }) {
  return (
    <div className="space-y-2">
      <div className={`h-24 w-full rounded-lg shadow-sm flex items-center justify-center ${bg} ${text} ${border ? 'border border-zinc-200 dark:border-zinc-800' : ''}`}>
        <span className="font-mono text-xs opacity-90">{hex}</span>
      </div>
      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{name}</p>
    </div>
  );
}

function IconBox({ icon: Icon, name }: { icon: any, name: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-md border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
      <Icon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
      <span className="text-xs text-zinc-500">{name}</span>
    </div>
  );
}




