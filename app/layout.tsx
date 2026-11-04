import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Preloader from "@/components/chrome/Preloader";
import Cursor from "@/components/chrome/Cursor";
import ScrollProgress from "@/components/chrome/ScrollProgress";
import Nav from "@/components/chrome/Nav";
import Footer from "@/components/chrome/Footer";
import { about, profile, skillGroups, socials } from "@/lib/content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const title = `${profile.name} — ${profile.role}`;
const description =
  "Software engineer building backend systems, APIs and full-stack products with Node.js, TypeScript, React, MongoDB, PostgreSQL and Redis — shipped to production with Docker and CI/CD. Based in Coimbatore, India.";

export const metadata: Metadata = {
  metadataBase: new URL(profile.site),
  title: { default: title, template: `%s — ${profile.name}` },
  description,
  applicationName: profile.name,
  authors: [{ name: profile.name, url: profile.site }],
  creator: profile.name,
  keywords: [
    "Kavin Nandha",
    "Kavin Nandha M K",
    "Software Engineer",
    "SDE",
    "Backend Engineer",
    "Full-stack Developer",
    "Node.js",
    "TypeScript",
    "React",
    "MongoDB",
    "PostgreSQL",
    "Redis",
    "Coimbatore",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: profile.site,
    siteName: profile.name,
    title,
    description,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f2ed",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  url: profile.site,
  email: `mailto:${profile.email}`,
  image: `${profile.site}${about.portrait.src}`,
  address: { "@type": "PostalAddress", addressLocality: "Coimbatore", addressCountry: "IN" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Sri Shakthi Institute of Engineering and Technology" },
  sameAs: socials.filter((s) => s.href.startsWith("http")).map((s) => s.href),
  knowsAbout: skillGroups.flatMap((g) => g.items).slice(0, 24),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
    >
      <body className="min-h-dvh bg-paper text-ink">
        {/* Without JavaScript nothing animates, so drop the overlay chrome
            and let the (fully rendered) page show as-is. */}
        <noscript>
          <style>{`[data-preloader],[data-cursor-root],[data-scroll-progress]{display:none!important}`}</style>
        </noscript>

        <a
          href="#main"
          className="label sr-only z-[200] rounded-full bg-ink px-4 py-3 text-paper focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Skip to content
        </a>

        <SmoothScroll>
          <Preloader />
          <Cursor />
          <ScrollProgress />
          <Nav />
          {children}
          <Footer />
        </SmoothScroll>

        <div className="grain" aria-hidden />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
