import dynamic from "next/dynamic";

const HomePageClient = dynamic(() => import("@/components/marketing/HomePageClient"), {
  loading: () => <main className="min-h-screen" />,
});

export default function HomePage() {
  return <HomePageClient />;
}
