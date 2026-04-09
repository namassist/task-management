import { Calendar } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  message: string
  icon?: React.ReactNode
}

export function EmptyState({ title = 'Nothing here yet', message, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-[rgba(35,38,52,0.18)] px-5 py-10 text-center">
      {icon || (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(140,170,238,0.12)] text-ctp-blue">
          <Calendar className="h-6 w-6" />
        </div>
      )}
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-ctp-text">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-ctp-subtext0">{message}</p>
    </div>
  )
}
