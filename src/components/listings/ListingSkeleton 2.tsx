export function ListingSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden animate-pulse">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 bg-gray-200 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="h-4 bg-gray-200 rounded w-28" />
              <div className="h-6 bg-gray-200 rounded-full w-16" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-40" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="h-10 bg-gray-100 rounded-xl" />
          <div className="h-10 bg-gray-100 rounded-xl" />
        </div>

        <div className="h-3 bg-gray-100 rounded w-full mb-1" />
        <div className="h-3 bg-gray-100 rounded w-3/4 mb-4" />

        <div className="border-t border-gray-100 pt-4">
          <div className="h-11 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
