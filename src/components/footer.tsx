import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Footer() {
  const [direction, setDirection] = useState<"vertical" | "horizontal">(
    "horizontal",
  );

  useEffect(() => {
    const handleResize = () => {
      setDirection(window.innerWidth >= 768 ? "horizontal" : "vertical");
    };

    // Set initial direction
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Clean up event listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={
        direction == "horizontal"
          ? "w-full py-2 max-w-[100%] mx-auto px-[24px] mt-[24px]"
          : "w-full max-w-[100%] mx-auto mt-[24px]"
      }
    >
      <Card className="p-4 gap-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Image src="/icon.svg" alt="GoatFi" width={28} height={28} />
            <h1
              className={`text-[20px] font-bold tracking-tight hidden sm:block weight-[700]`}
            >
              GOAT
            </h1>
            <span className="text-gray-300">Socials</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="p-2 h-auto text-gray-300"
              onClick={() => window.open("https://goat.fi", "_blank")}
            >
              <Globe className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              className="p-2 h-auto text-gray-300"
              onClick={() =>
                window.open("https://twitter.com/goatfidao", "_blank")
              }
            >
              <Image
                src="/socials/x.svg"
                alt="Twitter"
                width={16}
                height={16}
              />
            </Button>
            <Button
              variant="ghost"
              className="p-2 h-auto text-gray-300"
              onClick={() =>
                window.open("https://discord.com/invite/vbe6ZQzNP2", "_blank")
              }
            >
              <Image
                src="/socials/discord.svg"
                alt="Discord"
                width={20}
                height={20}
              />
            </Button>
          </div>
        </div>
        <Separator className="mx-1 border" />
        <div className="flex items-center justify-center space-x-4">
          <p className="text-gray-300">Made by @0xbiel</p>
          <Button
            variant="ghost"
            className="p-2 h-auto text-gray-500"
            onClick={() => window.open("https://twitter.com/0xbiel", "_blank")}
          >
            <Image src="/socials/x.svg" alt="Twitter" width={16} height={16} />
          </Button>
        </div>
      </Card>
    </div>
  );
}
