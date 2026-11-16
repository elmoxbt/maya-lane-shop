import { Check } from "lucide-react";
import { SubscribeForm } from "@/components/forms/subscribe-form";

const perks = ["7 follow-along workouts, 30 minutes or less", "No gym or equipment needed", "A printable habit tracker", "10% off your first order"];

export function LeadMagnet() {
  return (
    <section id="free-plan" aria-labelledby="free-plan-heading" className="scroll-mt-24 py-16 sm:py-24">
      <div className="container-page">
        <div className="grid grid-cols-1 items-center gap-10 overflow-hidden rounded-[2rem] bg-ember-soft p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:p-14">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-ember-strong uppercase">Free download</p>
            <h2 id="free-plan-heading" className="mt-2 font-display text-4xl leading-[1] font-extrabold tracking-tight text-balance sm:text-5xl">
              Your free 7-day workout plan.
            </h2>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              The exact week I give friends who want to start moving again. Drop your email and it lands in your inbox in seconds.
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {perks.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm font-medium">
                  <Check className="mt-0.5 size-4 shrink-0 text-ember-strong" aria-hidden /> {p}
                </li>
              ))}
            </ul>
            <SubscribeForm source="lead-magnet" className="mt-8 max-w-lg" />
            <p className="mt-3 text-xs text-muted-foreground">Join 64,000+ in the Lane Club newsletter. Unsubscribe anytime.</p>
          </div>
          <div className="relative mx-auto w-full max-w-xs" aria-hidden>
            <div className="absolute inset-0 translate-x-4 translate-y-4 rotate-6 rounded-2xl bg-ink/10" />
            <div className="relative flex aspect-[3/4] -rotate-3 flex-col justify-between rounded-2xl bg-ink p-7 text-white shadow-2xl">
              <div className="h-2 w-12 rounded-full bg-ember" />
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-ember">MAYA LANE</p>
                <p className="mt-2 font-display text-4xl leading-none font-extrabold">7-DAY KICKSTART</p>
                <p className="mt-3 text-sm text-white/70">30 minutes a day. No gym required.</p>
              </div>
              <p className="text-xs text-white/50">Free PDF · 8 pages</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
