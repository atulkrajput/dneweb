import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  Layers,
  MonitorSmartphone,
  Server,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import PublicLayout from '@/Layouts/PublicLayout';
import TechNetworkAnimation from '@/Components/TechNetworkAnimation';

const iconMap = { Bot, Layers, MonitorSmartphone, Server };

export default function Home({ page, capabilities, stats, servicesPreview }) {
  const seo = page || {};

  // The hero animation mounts ~50 infinitely-animating framer-motion nodes, which
  // is real main-thread work. Defer mounting it until the browser is idle so it
  // doesn't compete with hydration/interactivity during initial load (lowers TBT).
  // It's decorative and desktop-only (hidden lg:flex), so a brief delay is invisible.
  const [showHeroAnimation, setShowHeroAnimation] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const start = () => setShowHeroAnimation(true);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 2000 });
      return () => window.cancelIdleCallback?.(id);
    }
    const t = setTimeout(start, 600);
    return () => clearTimeout(t);
  }, []);

  const defaultCapabilities = [
    { title: 'AI & Automation', description: 'We deploy intelligent automation that handles the repetitive, accelerates the complex, and gives your team their time back.', icon: 'Bot' },
    { title: 'AI & SaaS Products', description: 'Custom-built SaaS platforms and AI-integrated products designed to scale with your business from day one.', icon: 'Layers' },
    { title: 'Web & Mobile Development', description: 'Modern, high-performance websites and mobile applications engineered for speed, usability, and conversion.', icon: 'MonitorSmartphone' },
    { title: 'IT & Managed Services', description: 'Enterprise-grade cloud, network, and infrastructure management. Your systems stay up. Your team stays focused.', icon: 'Server' },
  ];

  const defaultStats = [
    { value: '99.9%', label: 'Uptime across deployed client systems' },
    { value: '4 in 1', label: 'Technology disciplines under one contract' },
    { value: '< 24hrs', label: 'Average response time for client enquiries' },
  ];

  const defaultServicesPreview = [
    { title: 'AI & Automation', description: 'Automate workflows, reduce costs, and scale without adding headcount. We build custom AI agents, process automation pipelines, and intelligent integrations that work 24/7.' },
    { title: 'AI & SaaS Products', description: 'From concept to live product — we design and build AI-powered SaaS applications that your customers can rely on and your business can monetize.' },
    { title: 'Web & Mobile Development', description: "Beautiful isn't enough. We build fast, accessible, conversion-optimized websites and apps that perform across every device and platform." },
    { title: 'IT & Managed Services', description: 'Cloud migrations, cybersecurity, network management, and systems integration. Proactive IT that keeps your operations running at peak efficiency.' },
  ];

  const caps = capabilities || defaultCapabilities;
  const statsList = stats || defaultStats;
  const services = servicesPreview || defaultServicesPreview;

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <PublicLayout>
      <Head title={seo.meta_title || 'AI Automation & Technology Solutions | DNE Consultants'}>
        <meta name="description" content={seo.meta_description || 'DNE Consultants delivers AI automation, SaaS development, web & mobile apps, and managed IT services. One team. Full accountability. Real results.'} />
      </Head>

      {/* HERO */}
      <section className="relative min-h-[90dvh] flex items-center overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/30" />
          {/* Subtle radial glow behind globe area */}
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.04] dark:bg-primary/[0.07] rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/[0.03] dark:bg-blue-500/[0.05] rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="max-w-2xl">
              <span className="eyebrow">AI-Powered. Automation-First. Results-Driven.</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6" style={{ letterSpacing: '-0.02em' }}>
                We Build the Systems That Run Your Business.
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
                From intelligent AI automation to custom software and enterprise IT — DNE Consultants delivers end-to-end technology solutions that replace busywork with business growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/services" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full btn-primary text-base px-8 py-6">
                    Explore Our Services
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full btn-secondary text-base px-8 py-6">
                    Talk to Our Team
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.2 }} className="hidden lg:flex justify-center items-center">
              {showHeroAnimation
                ? <TechNetworkAnimation />
                : <div className="w-full aspect-square max-w-[500px] mx-auto" aria-hidden="true" />}
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="section-padding bg-secondary content-defer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
            <motion.div variants={itemVariant} className="max-w-3xl mb-16">
              <span className="eyebrow">What We Do</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">Four capabilities. One unified partner.</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Stop juggling multiple vendors. DNE brings AI, automation, software development, and IT infrastructure together under one roof — so every system works as one.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              {caps.map((cap) => {
                const Icon = iconMap[cap.icon] || Bot;
                return (
                  <motion.div key={cap.title} variants={itemVariant} className="flex flex-col h-full bg-card p-6 md:p-8 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">{cap.title}</h3>
                    <p className="text-muted-foreground leading-relaxed flex-1">{cap.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* WHY DNE */}
      <section className="section-padding bg-background border-y border-border/40 content-defer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
              <span className="eyebrow">Why Businesses Choose DNE</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">We don't just advise. We execute.</h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>Most technology partners hand you a strategy deck and leave you to figure out the rest. DNE is different. We integrate directly with your operations, deploy production-ready systems, and stay accountable for results.</p>
                <p>Whether you're a growing startup that needs a solid tech foundation, or an established business looking to automate and scale — we build the systems to get you there.</p>
              </div>
            </motion.div>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="space-y-6">
              {statsList.map((stat) => (
                <motion.div key={stat.value} variants={itemVariant}>
                  <Card className="bg-card p-6 md:p-8 border-l-4 border-l-primary border-y-0 border-r-0 rounded-r-xl rounded-l-none shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                      <span className="text-4xl md:text-5xl font-bold text-foreground tracking-tight whitespace-nowrap">{stat.value}</span>
                      <span className="text-muted-foreground text-base md:text-lg leading-snug">{stat.label}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* SERVICE PREVIEW CARDS */}
      <section className="section-padding bg-secondary content-defer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5 }} className="mb-16">
            <span className="eyebrow">Our Services</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">Built for businesses that move fast.</h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {services.map((service) => (
              <motion.div key={service.title} variants={itemVariant}>
                <Card className="flex flex-col h-full bg-card border-t-4 border-t-primary border-x-border border-b-border p-8 md:p-10 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all duration-300">
                  <h3 className="text-2xl font-semibold text-foreground mb-4">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed flex-1 mb-8 text-lg">{service.description}</p>
                  <Link href="/services" className="inline-flex items-center text-primary font-semibold hover:text-primary/80 transition-colors group mt-auto w-fit">
                    Learn More
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bg-primary py-24 relative overflow-hidden content-defer">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <span className="text-primary-foreground font-bold uppercase tracking-widest text-sm mb-4 block opacity-90">Ready to Start?</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">Let's build something that actually works.</h2>
            <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">Tell us where your biggest technology gap is. We'll show you exactly how to close it.</p>
            <Link href="/contact">
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90 text-base px-10 py-7 active:scale-[0.98] transition-transform shadow-xl w-full sm:w-auto">
                Schedule a Free Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
