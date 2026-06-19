import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-6 md:space-y-12 md:py-10">
      <Skeleton className="aspect-[16/9] w-full rounded-2xl md:aspect-[21/9]" />
      <div className="grid gap-3 sm:grid-cols-3"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-56 w-full" />
      <Skeleton className="h-40 w-full" />
    </main>
  )
}
