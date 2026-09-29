import Link from "next/link";
import Button from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative bg-gradient-to-br from-blue-950 via-blue-800 to-emerald-600 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <span className="inline-block bg-white/15 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-6 border border-white/20">
            🌅 About Horizon
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">
            Ethiopia's Home for <br /> Live Online Learning
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Horizon Virtual Training Center connects Ethiopian students with
            expert teachers through live classes, on-demand recordings, and
            verifiable certificates — all in one platform.
          </p>
        </div>
      </section>

      {/* ============ MISSION ============ */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            To make <strong>quality education accessible</strong> to every
            Ethiopian student — no matter where they live — through affordable,
            live, and interactive online classes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {[
            {
              icon: "🎯",
              title: "Accessible",
              desc: "Learn from anywhere in Ethiopia. All you need is a phone and internet.",
            },
            {
              icon: "🎥",
              title: "Live & Interactive",
              desc: "Real-time classes with expert teachers — not just pre-recorded videos.",
            },
            {
              icon: "💳",
              title: "Affordable",
              desc: "Pay easily with Telebirr or CBE Birr. Courses for every budget.",
            },
          ].map((v, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center"
            >
              <div className="text-5xl mb-3">{v.icon}</div>
              <h3 className="font-bold text-lg mb-2 text-blue-900">
                {v.title}
              </h3>
              <p className="text-gray-600 text-sm">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ STORY ============ */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Horizon Exists
          </h2>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p>
              In Ethiopia, thousands of students want to learn — but not every
              town has a good teacher for every subject. Private tutoring is
              expensive. Video courses online are often in English-only, made
              for other countries, and don't match our curriculum.
            </p>

            <p>
              <strong>Horizon changes that.</strong> We built a platform where
              Ethiopian teachers can teach live to students anywhere in the
              country. Students pay with Telebirr or CBE Birr. If they miss a
              class, they can watch the recording later. And when they complete
              a course, they get a verifiable certificate.
            </p>

            <p>
              Our vision is simple: <em>every Ethiopian student should be able
              to learn from the best teachers in the country — without leaving
              home.</em>
            </p>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-2 gap-12">
          {/* For Students */}
          <div className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-100">
            <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
              👨‍🎓 For Students
            </h3>
            <ol className="space-y-4">
              {[
                "Create a free account",
                "Browse courses by subject",
                "Pay with Telebirr or CBE Birr",
                "Join live classes weekly",
                "Watch recordings if you miss class",
                "Earn a certificate when done",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-800 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* For Teachers */}
          <div className="bg-emerald-50 rounded-2xl p-8 border-2 border-emerald-100">
            <h3 className="text-2xl font-bold text-emerald-900 mb-6 flex items-center gap-2">
              👩‍🏫 For Teachers
            </h3>
            <ol className="space-y-4">
              {[
                "Sign up as a teacher (free)",
                "Create your course",
                "Upload notes, videos, materials",
                "Schedule live sessions",
                "Teach students across Ethiopia",
                "Earn income from your students",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What Makes Horizon Special
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🎥", t: "Live Classes", d: "Real-time teaching — not just videos." },
              { icon: "📼", t: "Recorded Sessions", d: "Never miss a class — watch anytime." },
              { icon: "📁", t: "Course Materials", d: "PDFs, videos, slides — all downloadable." },
              { icon: "💳", t: "Local Payments", d: "Telebirr or CBE Birr — easy for all." },
              { icon: "🏆", t: "Verified Certificates", d: "Unique IDs — prove your skills." },
              { icon: "💬", t: "Direct Messaging", d: "Chat with teachers, ask questions." },
              { icon: "📱", t: "Works on Any Phone", d: "Even with slow internet." },
              { icon: "🇪🇹", t: "Built for Ethiopia", d: "Curriculum and language matter." },
              { icon: "🌍", t: "Learn Anywhere", d: "From Addis to any small town." },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="text-3xl mb-2">{f.icon}</div>
                <h3 className="font-bold mb-1 text-blue-900">{f.t}</h3>
                <p className="text-sm text-gray-600">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-blue-900 to-emerald-600 rounded-3xl p-10 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-white/90 mb-8 max-w-xl mx-auto">
            Questions? Partnership ideas? Want to teach on Horizon? We'd love to
            hear from you.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl mb-2">📧</div>
              <p className="text-sm text-white/70 mb-1">Email</p>
              <p className="font-semibold">hello@horizon.et</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📞</div>
              <p className="text-sm text-white/70 mb-1">Phone</p>
              <p className="font-semibold">+251 911 XXX XXX</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💬</div>
              <p className="text-sm text-white/70 mb-1">Telegram</p>
              <p className="font-semibold">@HorizonET</p>
            </div>
          </div>

          <div className="mt-10 flex gap-4 justify-center flex-wrap">
            <Link href="/courses">
              <Button variant="white" size="lg">
                Browse Courses
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="emerald" size="lg">
                Join Horizon Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {[
            {
              q: "Is Horizon free?",
              a: "Creating an account is free. Each course has its own price — you only pay for courses you choose. Many teachers offer free courses too.",
            },
            {
              q: "How do I pay?",
              a: "Pay easily with Telebirr or CBE Birr. You'll get a code (like HRZ-1234) to send to our admin. Once approved, your course unlocks instantly.",
            },
            {
              q: "What if I miss a live class?",
              a: "No problem! Every live class is recorded and available to watch anytime from your student dashboard.",
            },
            {
              q: "Do I get a certificate?",
              a: "Yes! After completing a course, you receive a verifiable certificate with a unique ID. You can download and print it as PDF.",
            },
            {
              q: "Can I teach on Horizon?",
              a: "Absolutely! Sign up as a teacher, create your course, and start teaching Ethiopian students across the country.",
            },
            {
              q: "Does it work on my phone?",
              a: "Yes — Horizon works on any smartphone with internet. No app install needed (though you can save it to your home screen).",
            },
          ].map((faq, i) => (
            <details
              key={i}
              className="bg-white border rounded-xl p-5 shadow-sm group"
            >
              <summary className="font-semibold cursor-pointer flex items-center justify-between text-blue-900">
                {faq.q}
                <span className="text-blue-800 group-open:rotate-180 transition">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-gray-600 text-sm">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}