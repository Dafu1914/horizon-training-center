export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white text-xl font-bold mb-3 flex items-center gap-2">
            <span>🌅</span> Horizon
          </h3>
          <p className="text-sm">
            Horizon Virtual Training Center — Learn live, learn anytime.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li>Courses</li>
            <li>Live Classes</li>
            <li>Teachers</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm">
            <li>Help Center</li>
            <li>Contact</li>
            <li>Terms</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Payments</h4>
          <p className="text-sm">Telebirr • CBE Birr</p>
        </div>
      </div>
      <div className="border-t border-slate-800 text-center text-sm py-4">
        © {new Date().getFullYear()} Horizon Virtual Training Center. All rights reserved.
      </div>
    </footer>
  );
}