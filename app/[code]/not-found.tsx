import Link from 'next/link'
import { MapPinOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md space-y-4 text-center">
        <MapPinOff className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
        <h1 className="text-2xl font-semibold">Imóvel não encontrado</h1>
        <p className="text-muted-foreground">Verifique o código no seu e-mail de reserva. Códigos válidos têm o formato <code className="font-mono">XXX000</code> (ex: <code className="font-mono">FLN001</code>).</p>
        <Button render={<Link href="/" />}>Voltar ao início</Button>
      </div>
    </main>
  )
}
