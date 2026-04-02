import HomePageClient from "@/components/marketing/HomePageClient";
import ProductModel from "@/models/Product";
import { dbConnect } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

type HomeProduct = {
  slug: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number | null;
  rating?: number;
  images?: string[];
};

async function getHomeProducts(): Promise<HomeProduct[]> {
  try {
    await dbConnect();
    const products = await ProductModel.find({}).sort({ createdAt: -1 }).limit(3).lean();
    return JSON.parse(JSON.stringify(products)) as HomeProduct[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getHomeProducts();
  return <HomePageClient products={products} />;
}
