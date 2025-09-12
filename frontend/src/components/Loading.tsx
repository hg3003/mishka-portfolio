export default function Loading() {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-swiss-black animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-t-2 border-b-2 border-swiss-gray-400 animate-spin animate-reverse"></div>
          </div>
        </div>
      </div>
    );
  }
  
  export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
    };
  
    return (
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-swiss-gray-300 border-t-swiss-black`} />
    );
  }