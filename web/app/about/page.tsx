import { Metadata } from "next";
import AboutClient from "@/components/marketing/AboutClient";

// If you want to keep force-dynamic, although it might not be necessary if not fetching db
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us | Smart Garden AIoT",
  description: "Học thêm về sứ mệnh và công nghệ của Smart Garden AIoT",
};

export default function AboutPage() {
  return <AboutClient />;
}
