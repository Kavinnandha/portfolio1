import Hero from "@/components/sections/Hero";
import Intro from "@/components/sections/Intro";
import Stats from "@/components/sections/Stats";
import Work from "@/components/sections/Work";
import MoreProjects from "@/components/sections/MoreProjects";
import Lifecycle from "@/components/sections/Lifecycle";
import Experience from "@/components/sections/Experience";
import Stack from "@/components/sections/Stack";
import Recognition from "@/components/sections/Recognition";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Intro />
      <Stats />
      <Work />
      <MoreProjects />
      <Lifecycle />
      <Experience />
      <Stack />
      <Recognition />
      <About />
      <Contact />
    </main>
  );
}
