import { Hero } from "@/components/marketing/hero";
import { Services } from "@/components/marketing/services";
import { Process } from "@/components/marketing/process";
import { CTA } from "@/components/marketing/cta";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Process />
      <CTA />
    </>
  );
}
