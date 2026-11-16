const items = ["Free shipping over $75", "The holiday gift guide is live", "New: Do It Scared Boxy Tee", "Digital products delivered instantly", "Made to last, not to trend"];

export function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-ink bg-ember py-3 text-ink" aria-label="Announcements">
      <ul className="flex w-max animate-[marquee_38s_linear_infinite] gap-10 font-display text-lg font-extrabold tracking-tight uppercase motion-reduce:animate-none sm:text-xl">
        {row.map((t, i) => (
          <li key={i} className="flex items-center gap-10 whitespace-nowrap" aria-hidden={i >= items.length}>
            {t} <span aria-hidden>✦</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
