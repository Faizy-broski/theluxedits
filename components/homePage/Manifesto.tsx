export default function Manifesto() {
  return (
    <section className="relative overflow-hidden border-y border-black/10 bg-white py-24 text-black md:py-32 lg:py-44">
      <div className="relative mx-auto flex min-h-[360px] max-w-6xl items-center justify-center px-5 text-center lg:px-0">
        {/* Background word */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center font-fraunces text-[70px] font-light leading-none tracking-[-0.06em] text-black/[0.035] sm:text-[120px] md:text-[200px] lg:text-[350px]"
        >
          LUXX
        </div>

        {/* Foreground content */}
        <div className="relative z-10">
          <p className="mb-12 font-jet text-xs uppercase text-black/55">
            — Our Promise
          </p>

          <h2 className="mx-auto max-w-[1050px] font-fraunces text-3xl font-light leading-[0.95] tracking-[-0.065em] sm:text-5xl md:text-6xl lg:text-7xl">
            Luxury is not <em className="italic text-black/45">imitation.</em>
            <br />
            It is <em className="italic">authenticity,</em> delivered.
          </h2>

          <p className="mt-20 font-jet text-[10px] uppercase text-black/50">
            LUXX EDIT · 100% Authentic · Expert Verified · Worldwide Shipping
          </p>
        </div>
      </div>
    </section>
  );
}
