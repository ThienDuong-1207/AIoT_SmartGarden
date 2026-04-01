import dynamic from "next/dynamic";

const AILabClient = dynamic(() => import("./AILabClient"), {
  loading: () => <div className="space-y-6" />,
});

export default function AILabPage() {
  return <AILabClient />;
}
