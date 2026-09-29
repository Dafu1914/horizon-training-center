import Link from "next/link";
import Button from "@/components/ui/Button";

export default function SubscribePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div className="bg-gradient-to-br from-blue-900 to-emerald-600 rounded-3xl p-12 text-center text-white">
        <div className="text-6xl mb-4">✨</div>
        <h1 className="text-4xl font-bold mb-4">
          Horizon Subscribe
        </h1>
        <p className="text-lg text-white/90 max-w-xl mx-auto mb-8">
          Get unlimited access to <strong>every course</strong> on Horizon for
          one low monthly price. Learn without limits.
        </p>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 max-w-md mx-auto mb-8">
          <p className="text-3xl font-bold mb-1">
            999 ETB <span className="text-lg font-normal opacity-80">/month</span>
          </p>
          <p className="text-sm opacity-80 mb-4">Cancel anytime</p>
          <ul className="text-left space-y-2 text-sm">
            <li>✅ Access to all courses</li>
            <li>✅ All live sessions included</li>
            <li>✅ Unlimited certificates</li>
            <li>✅ Download course materials</li>
            <li>✅ Priority support</li>
          </ul>
        </div>

        <div className="inline-block bg-amber-100 text-amber-900 px-6 py-3 rounded-full font-semibold text-sm">
          🚀 Coming Soon — Notify me when ready
        </div>

        <div className="mt-10 flex gap-3 justify-center flex-wrap">
          <Link href="/courses">
            <Button variant="white" size="lg">
              Browse Courses
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Back Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}