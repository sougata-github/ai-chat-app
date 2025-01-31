import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "../ui/button";

const Hero = () => {
  return (
    <section className="mx-auto mt-4 flex max-w-6xl flex-col p-20 text-center md:mt-8">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl">
          Welcome to<span className="font-semibold italic">Vertext.AI</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground md:text-lg">
          A minimalistic ai-powered chatbot built using Next.js and DeepSeek r1.
        </p>

        <Button className="group mt-4 w-fit gap-1" asChild>
          <Link href="/sign-up">
            Get Started
            <ChevronRight className="size-4 transition-all duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Hero;
