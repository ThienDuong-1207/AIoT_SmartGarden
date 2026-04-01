import dynamic from "next/dynamic";

const PlantDoctorClient = dynamic(() => import("./PlantDoctorClient"), {
  loading: () => <div className="space-y-6" />,
});

export default function PlantDoctorPage() {
  return <PlantDoctorClient />;
}
