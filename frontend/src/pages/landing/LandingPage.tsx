import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Logo } from "../../components/shared/Logo";
import { Footer } from "../../components/shared/Footer";
import {
  Map, TrendingUp, ShieldCheck, FileText, Activity, Database,
  ChevronRight, ArrowRight, Users, Layers
} from "lucide-react";
import heroMapImg from "../../assets/images/hero-map.png";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const FEATURES = [
  { icon: <Map className="w-6 h-6" />, title: "GIS Map Monitoring", desc: "Color-coded disease hotspot mapping per municipality with real-time farm location overlays." },
  { icon: <Activity className="w-6 h-6" />, title: "ARIMA + Random Forest", desc: "Hybrid time-series and ensemble model forecasting for 6-month disease outbreak prediction." },
  { icon: <ShieldCheck className="w-6 h-6" />, title: "Prescriptive Engine", desc: "Automated rule-based action plans — quarantines, movement restrictions, biosecurity protocols." },
  { icon: <FileText className="w-6 h-6" />, title: "Permit Management", desc: "Digital meat transport permit requests with MAO review and approval workflows." },
  { icon: <Layers className="w-6 h-6" />, title: "Supply Chain Traceability", desc: "End-to-end swine tracking from farm registration to market distribution." },
  { icon: <Database className="w-6 h-6" />, title: "Role-Based Dashboards", desc: "Tailored views for MAO, PAO, farm owners, and veterinarians — each with scoped access." },
];

const ROLES = [
  { role: "Farm Owner", desc: "Register farms, report disease incidents, request transport permits, and view biosecurity alerts.", path: "/farm-login", cta: "Farm Owner Login", color: "bg-emerald-600" },
  { role: "MAO Administrator", desc: "Full administrative access — manage farms, review permits, run forecasts, and generate prescriptive recommendations.", path: "/mao-login", cta: "MAO Login", color: "bg-blue-600" },
  { role: "Veterinarian", desc: "Log field inspection results, verify health certificates, and update disease outbreak status.", path: "/vet-login", cta: "Veterinarian Login", color: "bg-violet-600" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center gap-3">
              <Link to="/farm-login" className="hidden sm:block text-sm text-slate-600 hover:text-brand-600 font-medium transition-colors">Sign In</Link>
              <Link to="/farm-signup" className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                Register Farm
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-brand-50 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-100/40 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div initial="hidden" animate="visible" variants={stagger}>
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold mb-6 ring-1 ring-brand-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
                  </span>
                  Laguna Province Pilot Program
                </motion.div>
                <motion.h1 variants={fadeUp} className="text-5xl lg:text-6xl font-display font-bold text-slate-900 leading-[1.08] tracking-tight mb-6">
                  Smarter swine health.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-400">Safer supply chains.</span>
                </motion.h1>
                <motion.p variants={fadeUp} className="text-lg text-slate-600 mb-8 leading-relaxed">
                  SwineTrack combines ARIMA forecasting and Random Forest analytics with rule-based prescriptive recommendations — giving agricultural offices real-time intelligence from farm to market.
                </motion.p>
                <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                  <Link to="/farm-signup" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-7 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-brand-600/25 text-sm">
                    Register Your Farm <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/mao-login" className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-7 py-3.5 rounded-xl font-semibold transition-all text-sm">
                    MAO / Official Access
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white p-2">
                  <img src={heroMapImg} alt="SwineTrack Map Dashboard" className="w-full h-auto rounded-xl object-cover" />
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                    className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-3.5 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600"><TrendingUp className="w-5 h-5" /></div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">ARIMA Forecast</p>
                      <p className="text-lg font-bold text-slate-900">6-Month Outlook</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-brand-950 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { val: "10", label: "Municipalities" },
                { val: "3", label: "Disease Models" },
                { val: "6-mo", label: "Forecast Window" },
                { val: "4", label: "Role Dashboards" },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <p className="text-4xl font-display font-bold text-white mb-1">{s.val}</p>
                  <p className="text-brand-300 text-sm font-medium">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <p className="text-brand-600 font-semibold tracking-wide uppercase text-xs mb-3">Platform Capabilities</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Everything you need to fight disease outbreaks</h2>
              <p className="text-slate-600 text-lg">From predictive modeling to permit management, SwineTrack centralizes the entire swine health ecosystem.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl p-7 border border-slate-100 hover:border-brand-200 hover:shadow-soft transition-all group cursor-default">
                  <div className="w-11 h-11 bg-brand-50 group-hover:bg-brand-600 rounded-xl flex items-center justify-center text-brand-600 group-hover:text-white transition-colors mb-5">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Role portals */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-brand-600 font-semibold tracking-wide uppercase text-xs mb-3">Access Portals</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Sign in to your portal</h2>
              <p className="text-slate-600">Each stakeholder has a dedicated, role-specific portal tailored to their responsibilities.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {ROLES.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-7 hover:shadow-md transition-all flex flex-col">
                  <div className={`w-10 h-10 rounded-xl ${r.color} flex items-center justify-center mb-5`}>
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{r.role}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed flex-grow mb-6">{r.desc}</p>
                  <Link to={r.path} className={`inline-flex items-center justify-center gap-2 ${r.color} hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all`}>
                    {r.cta} <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-brand-900 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Aligned with DA-BAI Standards</h2>
            <p className="text-brand-100 mb-8 text-lg">Developed in collaboration with the Provincial Agriculture Office of Laguna. Built for the Bureau of Animal Industry's traceability requirements.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Laguna Pilot", "ARIMA Forecasting", "GIS Mapping", "Prescriptive Analytics", "BAI Standards"].map(t => (
                <span key={t} className="px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm font-medium">{t}</span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
