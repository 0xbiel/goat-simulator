import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Manrope } from "next/font/google";

const manrope = Manrope({ weight: "700", subsets: ["latin"] });

export default function Navbar() {
  return (
    <div className="w-full py-2">
      <div className="w-full max-w-[90%] mx-auto flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Image src="/icon.svg" alt="GoatFi" width={36} height={36} />
          <h1
            className={`text-[28px] font-bold tracking-tight hidden sm:block ${manrope.className}`}
          >
            GOAT Simulator
          </h1>
        </div>

        <Button
          variant="default"
          className="ml-auto bg-[#6C33B6]"
          onClick={() => window.open("https://app.goat.fi", "_blank")}
        >
          <ExternalLink className="mr-2" />
          Open App
        </Button>
      </div>
    </div>
  );
}
