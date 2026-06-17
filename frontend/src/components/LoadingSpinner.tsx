import Logo from "./Logo"

export default function LoadingSpinner({ fullPage = false }: { fullPage?: boolean }) {
  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <div className="relative">
          <Logo size={40} className="text-primary animate-pulse relative z-10" />
          <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
        </div>
        <p className="text-foreground text-sm font-bold tracking-widest uppercase animate-pulse">Curating your experience...</p>
      </div>
    )
  }

  // Skeleton grid for products
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 w-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <div 
          key={i} 
          className="flex flex-col h-full"
        >
          <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden mb-4 bg-muted/30">
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
          
          <div className="flex flex-col flex-1 justify-between gap-4">
            <div>
              <div className="h-2 w-16 bg-muted/50 rounded-full mb-3" />
              <div className="h-4 w-3/4 bg-muted/50 rounded-full mb-3" />
              <div className="h-3 w-1/4 bg-muted/50 rounded-full" />
            </div>
            
            <div>
              <div className="h-6 w-1/3 bg-muted/50 rounded-full mb-4" />
              <div className="flex gap-2">
                <div className="h-12 flex-1 bg-muted/50 rounded-2xl" />
                <div className="h-12 flex-1 bg-muted/50 rounded-2xl" />
                <div className="h-12 w-12 bg-muted/50 rounded-2xl shrink-0" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
