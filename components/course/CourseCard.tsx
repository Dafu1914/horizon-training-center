import Link from "next/link";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

type CourseCardProps = {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  category: string;
};

export default function CourseCard({
  id,
  title,
  description,
  price,
  thumbnail,
  category,
}: CourseCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition border border-gray-100">
      <div className="h-40 bg-gradient-to-br from-blue-700 to-emerald-500 flex items-center justify-center text-white text-3xl">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          "📚"
        )}
      </div>
      <div className="p-5">
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
          {category}
        </span>
        <h3 className="text-lg font-bold mt-3 line-clamp-1">{title}</h3>
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-blue-800">
            {formatPrice(price)}
          </span>
          <Link href={`/courses/${id}`}>
            <Button size="sm">View</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}