import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Map, TrendingUp, ShieldCheck, FileText, Activity, Layers, MapPin, Users, Database } from "lucide-react";

import heroMapImg from "../assets/images/hero-map.png";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
              <motion.div 
                className="lg:col-span-6 text-center lg:text-left"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-sm font-semibold mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                  </span>
                  Laguna Province Pilot
                </motion.div>
                <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl font-display font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
                  Predictive intelligence for safer <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">pork supply chains.</span>
                </motion.h1>
                <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                  From farm to market, every swine traced. Real-time disease monitoring, ARIMA-based forecasting, and biosecurity protocols across every municipality.
                </motion.p>
                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/signup" className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-xl font-medium transition-all shadow-soft text-center shadow-brand-600/30 hover:shadow-brand-600/40">
                    Register Your Farm
                  </Link>
                  <Link to="/login" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-3.5 rounded-xl font-medium transition-all text-center">
                    Access Dashboard
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div 
                className="lg:col-span-6 mt-16 lg:mt-0"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-white p-2">
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 to-transparent z-10 pointer-events-none rounded-xl" />
                  <img 
                    src={heroMapImg} 
                    alt="SwineTrack Map Monitoring Dashboard" 
                    className="w-full h-auto rounded-xl object-cover aspect-[4/3] relative z-0"
                  />
                  
                  {/* Floating Stats Card on Hero */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Tracked</p>
                      <p className="text-xl font-bold text-slate-900">40,230 swine</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="bg-brand-950 py-12 border-y border-brand-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-brand-800/50">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                <p className="text-4xl font-display font-bold text-white mb-2">10</p>
                <p className="text-brand-300 text-sm font-medium">Municipalities</p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                <p className="text-4xl font-display font-bold text-white mb-2">487</p>
                <p className="text-brand-300 text-sm font-medium">Registered Farms</p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                <p className="text-4xl font-display font-bold text-white mb-2">6-mo</p>
                <p className="text-brand-300 text-sm font-medium">ARIMA Forecast</p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  <p className="text-4xl font-display font-bold text-white">8</p>
                </div>
                <p className="text-brand-300 text-sm font-medium">Active Monitoring Zones</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-3">Capabilities</h2>
              <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Command center for agricultural health</h3>
              <p className="text-slate-600 text-lg">
                SwineTrack provides a unified view of the entire provincial supply chain, enabling data-driven decisions from farm registration to market distribution.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Map className="w-6 h-6" />,
                  title: "Real-time Map Monitoring",
                  desc: "Interactive GIS visualization of farm locations, movement routes, and disease outbreak zones across Laguna."
                },
                {
                  icon: <Activity className="w-6 h-6" />,
                  title: "ARIMA Predictive Analytics",
                  desc: "Advanced time-series forecasting for disease spread probability and future swine supply volumes."
                },
                {
                  icon: <ShieldCheck className="w-6 h-6" />,
                  title: "Prescriptive Recommendations",
                  desc: "Automated alert system suggesting targeted quarantines, movement bans, and biosecurity interventions."
                },
                {
                  icon: <FileText className="w-6 h-6" />,
                  title: "Permit & Registration",
                  desc: "Streamlined digital processing for farm accreditations, shipping permits, and veterinary health certificates."
                },
                {
                  icon: <Layers className="w-6 h-6" />,
                  title: "Supply Chain Traceability",
                  desc: "End-to-end tracking from farm gates to slaughterhouses to public markets using digital manifests."
                },
                {
                  icon: <Database className="w-6 h-6" />,
                  title: "Role-Based Dashboards",
                  desc: "Customized data views for MAO admins, PAO officers, farm owners, and field veterinarians."
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-brand-200 hover:shadow-soft transition-all group"
                >
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-6">Built for every stakeholder in the ecosystem.</h2>
                <p className="text-slate-600 text-lg mb-8">
                  A centralized platform doesn't work if it's not useful on the ground. SwineTrack provides tailored tools for every role to ensure compliance and efficiency.
                </p>
                
                <div className="space-y-6">
                  {[
                    { role: "Municipal Agriculture Office (MAO)", desc: "Manage local farm registries, issue permits, and monitor municipal-level disease reports." },
                    { role: "Provincial Agriculture Office (PAO)", desc: "Oversee province-wide supply trends, analyze predictive models, and enforce broad quarantine zones." },
                    { role: "Farm Owners", desc: "Report herd health, apply for shipping permits, and receive automated biosecurity alerts." },
                    { role: "Veterinarians", desc: "Log field inspection results, verify health certificates, and update outbreak status." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="mt-1">
                        <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900">{item.role}</h5>
                        <p className="text-slate-600 text-sm mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-brand-100 to-green-50 rounded-[2.5rem] transform -rotate-3"></div>
                <div className="relative bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
                  <div className="space-y-4">
                    <div className="h-4 bg-slate-100 rounded w-1/3 mb-8"></div>
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg shrink-0"></div>
                      <div className="flex-grow space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                        <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg shrink-0"></div>
                      <div className="flex-grow space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                        <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                        <div className="h-3 bg-brand-50 rounded w-1/3 mt-2"></div>
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg shrink-0"></div>
                      <div className="flex-grow space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-full"></div>
                        <div className="h-3 bg-slate-100 rounded w-4/5"></div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-6 -bottom-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 max-w-[200px]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <p className="text-xs font-bold text-slate-900">Alert Generated</p>
                    </div>
                    <p className="text-[10px] text-slate-500">Movement restriction recommended for Zone B.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Credibility / Capstone */}
        <section className="py-20 bg-brand-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
              <MapPin className="w-8 h-8 text-brand-300" />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">Aligned with DA-BAI Standards</h2>
            <p className="text-brand-100 max-w-2xl mx-auto mb-10">
              Developed as a capstone initiative in close collaboration with the Provincial Agriculture Office of Laguna. Designed to meet the stringent traceability requirements of the Bureau of Animal Industry.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium">Laguna Pilot Program</span>
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium">Academic Capstone Project</span>
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium">Government Framework</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-50 rounded-l-[100px] transform translate-x-1/3"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-display font-bold text-slate-900 mb-6">Ready to join the network?</h2>
              <p className="text-lg text-slate-600 mb-8">
                Whether you're a government official monitoring province-wide health or a farm owner managing daily operations, SwineTrack provides the tools you need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg shadow-brand-600/25 text-center text-lg">
                  Create Account
                </Link>
                <Link to="/login" className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-8 py-4 rounded-xl font-medium transition-all text-center text-lg">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
