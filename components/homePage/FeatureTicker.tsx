const items = [
  "Luxury Shoes",
  "Designer Bags",
  "Premium Watches",
  "Fine Perfumes",
  "Top Electronics",
  "100% Authentic",
  "Free Shipping $200+",
  "Expert Verified",
];

// Duplicate items so the second set takes over seamlessly when the first scrolls off
const ticker = [...items, ...items];

const SparkleIcon = ({ id }: { id: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="shrink-0"
  >
    <path
      d="M10.9207 23.04C10.7007 21.74 10.1207 20.34 9.1807 18.84C8.2407 17.32 6.9007 15.91 5.1607 14.61C3.4407 13.31 1.7207 12.48 0.000703208 12.12V10.86C1.7007 10.46 3.3307 9.72003 4.8907 8.64003C6.4707 7.54003 7.7907 6.22003 8.8507 4.68003C9.9307 3.10003 10.6207 1.54003 10.9207 2.89679e-05H12.1807C12.3607 1.00003 12.7207 2.03003 13.2607 3.09003C13.8007 4.13003 14.4907 5.13003 15.3307 6.09003C16.1907 7.03003 17.1507 7.88003 18.2107 8.64003C19.7907 9.76003 21.4007 10.5 23.0407 10.86V12.12C21.9407 12.34 20.8007 12.79 19.6207 13.47C18.4607 14.15 17.3807 14.96 16.3807 15.9C15.3807 16.82 14.5607 17.79 13.9207 18.81C12.9807 20.31 12.4007 21.72 12.1807 23.04H10.9207Z"
      fill={`url(#sparkle-${id})`}
    />
    <defs>
      <linearGradient
        id={`sparkle-${id}`}
        x1="10.1646"
        y1="-7.21997"
        x2="10.1646"
        y2="28.78"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#2A2A2A" />
        <stop offset="0.35" stopColor="#707080" />
        <stop offset="0.5" stopColor="#F8F8FB" />
        <stop offset="0.65" stopColor="#707080" />
        <stop offset="1" stopColor="#2A2A2A" />
      </linearGradient>
    </defs>
  </svg>
);

export default function FeatureTicker() {
  return (
    <section aria-label="Feature highlights" className="w-full overflow-hidden border-y border-black bg-white">
      <div className="animate-marquee flex min-w-max items-center">
        {ticker.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center">
            <span className="whitespace-nowrap px-6 py-4 font-against text-xl font-light text-black sm:px-8 sm:text-2xl">
              {item}
            </span>
            <SparkleIcon id={String(index)} />
          </div>
        ))}
      </div>
    </section>
  );
}
