import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";

export default function Home() {
  return (
    <main className="flex flex-col overflow-hidden">
      <Navbar />
      <Hero />
    </main>
  );
}
