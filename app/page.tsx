import Link from "next/link";
import Button from "@/components/ui/Button";
import CourseCard from "@/components/course/CourseCard";

export default function HomePage() {
  const sampleCourses = [
    {
      id: "1",
      title: "Mathematics Grade 12",
      description: "Complete Ethiopian Grade 12 math prep with live weekly classes.",
      price: 500,
      category: "Math",
    },
    {
      id: "2",
      title: "English for Beginners",
      description: "Speak English confidently with live practice sessions.",
      price: 400,
      category: "Language",
    },
    {
      id: "3",
      title: "Intro to Programming",
      description: "Learn Python and web basics with a live instructor.",
      price: 800,
      category: "Tech",
    },
  ];

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative bg-gradient-to-br from-blue-950 via-blue-800 to-cyan-600 text-white overflow-hidden">
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
          <span className="inline-block bg-white/15 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-6 border border-white/20">
            🇪🇹 Ethiopia's Live Training Platform
          </span>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">
            Learn Live. <br /> Reach Your Horizon.
          </h1>

          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10">
            Join live virtual classes with expert teachers. Missed a class?
            Watch the recording anytime. Pay easily with Telebirr or CBE Birr.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/courses">
              <Button variant="white" size="lg">
                Browse Courses
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="emerald" size="lg">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="bg-emerald-50 border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "1,200+", label: "Students" },
            { value: "50+", label: "Expert Teachers" },
            { value: "120+", label: "Courses" },
            { value: "4.8★", label: "Avg Rating" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl font-bold text-blue-800">{s.value}</div>
              <div className="text-sm text-gray-600 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
          Why Choose Horizon?
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Everything you need to learn effectively — online, live, and at your own pace.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: "🎥", title: "Live Classes", desc: "Attend real-time classes with teachers and classmates." },
            { icon: "📼", title: "Recorded Videos", desc: "Missed a class? Watch it anytime, anywhere." },
            { icon: "💳", title: "Local Payments", desc: "Pay easily with Telebirr or CBE Birr." },
            { icon: "🏆", title: "Certificates", desc: "Earn a certificate after completing your course." },
            { icon: "📱", title: "Works on Mobile", desc: "Install like an app. Works on any phone." },
            { icon: "🌍", title: "For Ethiopians", desc: "Built for Ethiopian students, teachers, and schools." },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2 text-blue-900">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURED COURSES ============ */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold">Featured Courses</h2>
            <Link
              href="/courses"
              className="text-blue-800 font-semibold hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {sampleCourses.map((c) => (
              <CourseCard key={c.id} {...c} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { n: "1", t: "Sign Up", d: "Create your free account in seconds." },
            { n: "2", t: "Choose Course", d: "Browse and enroll in courses you love." },
            { n: "3", t: "Pay Easily", d: "Use Telebirr or CBE Birr to pay." },
            { n: "4", t: "Learn Live", d: "Join live classes or watch recordings." },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-14 h-14 rounded-full bg-blue-800 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                {s.n}
              </div>
              <h3 className="font-bold text-lg mb-2">{s.t}</h3>
              <p className="text-gray-600 text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-900 to-emerald-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-white/90 mb-8 max-w-xl mx-auto">
            Join thousands of Ethiopian students learning live with expert teachers.
          </p>
          <Link href="/register">
            <Button variant="white" size="lg">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}