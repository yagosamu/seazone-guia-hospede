import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <main className="flex flex-col">
      <Skeleton className="h-[60vh] min-h-[420px] w-full rounded-none md:h-[72vh] md:min-h-[520px]" />
      <div className="border-border border-b">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-0 px-6 md:grid-cols-3 md:px-10">
          <Skeleton className="my-6 h-14 md:my-7" />
          <Skeleton className="my-6 h-14 md:my-7" />
          <Skeleton className="my-6 h-14 md:my-7" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl space-y-16 px-6 py-14 md:space-y-24 md:px-10 md:py-20">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-44 w-full" />
      </div>
    </main>
  )
}
