interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'กำลังโหลด...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-green-600 ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-4 text-gray-600 text-sm">{text}</p>
      )}
    </div>
  )
}

export function PageLoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

export function AuthLoadingSpinner() {
  return (
    <PageLoadingSpinner text="กำลังตรวจสอบการยืนยันตัวตน..." />
  )
}