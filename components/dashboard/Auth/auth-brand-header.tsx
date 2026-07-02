import { ShoppingBag } from "lucide-react";

export function AuthBrandHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/10">
        <ShoppingBag className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="font-against text-[19px] leading-tight tracking-wide text-[#F7F3EA]">
          TheLuxEdits
        </p>
        <p className="font-jet text-[10px] uppercase tracking-wider text-[#9FB3A4]">
          Luxury Ecommerce Admin Panel
        </p>
      </div>
    </div>
  );
}