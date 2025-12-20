export default function Loading() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-zinc-50 dark:bg-black">
      {/* Toolbar Skeleton */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <div className="w-24 h-8 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
            <div className="w-24 h-8 ml-2 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
            <div className="w-24 h-8 ml-2 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          </div>
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex gap-1">
            <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
            <div className="w-12 h-8 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
            <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-32 h-9 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 p-8 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-40 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-3/4 h-5 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                <div className="w-8 h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
              </div>
              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4 overflow-hidden">
                <div className="h-full w-1/2 bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
              </div>
              <div className="flex justify-between mt-8">
                <div className="w-12 h-3 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                <div className="w-16 h-3 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}












