import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, User } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import PublicLayout from '@/Layouts/PublicLayout';

export default function About({ page, team, values, stats }) {
  const seo = page || {};

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const defaultValues = [
    { number: "01", title: "Execution Over Advice", description: "We don't just hand over a strategy deck and walk away. We build, deploy, and maintain the systems we recommend." },
    { number: "02", title: "Integration Over Fragmentation", description: "Siloed technology creates friction. We ensure your AI, software, and IT infrastructure communicate seamlessly." },
    { number: "03", title: "Accountability Over Excuses", description: "When you work with DNE, the buck stops with us. We take full ownership of the technology stack." }
  ];

  const defaultTeam = [
    { name: "Marcus Chen", role: "Head of AI & Automation", bio: "Former enterprise architect specializing in LLM integration and process automation pipelines." },
    { name: "Sarah Jenkins", role: "Lead Product Engineer", bio: "Full-stack developer with 12+ years building scalable SaaS platforms and custom web applications." },
    { name: "David Okafor", role: "Director of IT Infrastructure", bio: "Cloud migration expert and cybersecurity specialist managing enterprise-grade networks." }
  ];

  const defaultStats = [
    { value: "100%", label: "Senior-led project teams" },
    { value: "4 disciplines", label: "AI, Dev, Automation & IT under one contract" },
    { value: "1 point of contact", label: "No account manager handoffs" }
  ];

  const teamData = team || defaultTeam;
  const valuesData = values || defaultValues;
  const statsData = stats || defaultStats;

  return (
    <PublicLayout>
      <Head>
        <title>{seo.meta_title || 'About DNE Consultants | AI & Technology Partner'}</title>
        <meta name="description" content={seo.meta_description || "DNE Consultants is an execution-first technology partner specialising in AI, automation, software, and IT."} />
      </Head>

      {/* HERO */}
      <section className="relative min-h-[80dvh] flex items-center justify-center overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1582014244066-dea9298becb2" alt="Abstract geometric architecture" className="w-full h-full object-cover opacity-20 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <span className="eyebrow inline-block">About DNE Consultants</span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-8 leading-tight" style={{ letterSpacing: '-0.02em' }}>
              We're not consultants who advise. We're builders who deliver.
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              DNE was built on one simple belief: businesses deserve a technology partner that takes full ownership — from strategy to shipped product to ongoing support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="lg:col-span-5">
              <span className="eyebrow">Who We Are</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">Technology should simplify business, not complicate it.</h2>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-7 lg:pl-12">
              <div className="prose prose-lg prose-invert max-w-none text-muted-foreground">
                <p className="mb-6">For too long, companies have been forced to choose between high-level strategic consultants who don't write code, and offshore development shops that need every detail micromanaged.</p>
                <p className="mb-6">We are a collective of senior engineers, AI specialists, and IT architects who understand business outcomes. When you hire us, you aren't just getting a vendor to complete a task list.</p>
                <p>Whether we're automating your back-office workflows, building a custom SaaS product, or managing your cloud infrastructure, our goal remains the same: to give you technology that works quietly and powerfully in the background.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="section-padding bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="mb-16 max-w-3xl">
            <span className="eyebrow">How We Work</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">Three principles we don't compromise on.</h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valuesData.map((value) => (
              <motion.div key={value.number} variants={itemVariant} className="relative group">
                <div className="h-full bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-colors duration-300 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 text-8xl font-extrabold text-primary/5 group-hover:text-primary/10 transition-colors duration-300 pointer-events-none select-none">{value.number}</div>
                  <div className="relative z-10">
                    <span className="text-primary font-bold text-xl mb-4 block">{value.number}.</span>
                    <h3 className="text-2xl font-semibold text-foreground mb-4">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TEAM */}
      <section className="section-padding bg-background border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="mb-16 text-center max-w-3xl mx-auto">
            <span className="eyebrow">The Team</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">Senior people. No hand-offs to juniors.</h2>
            <p className="text-lg text-muted-foreground">When you partner with DNE, the experts you speak with on day one are the same experts building your systems.</p>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            {teamData.map((member, index) => (
              <motion.div key={index} variants={itemVariant} className="flex flex-col items-center text-center group bg-card border border-border/50 p-8 rounded-2xl hover:border-primary/30 transition-colors">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-secondary border-2 border-border flex items-center justify-center mb-6 group-hover:border-primary/50 transition-colors duration-300 overflow-hidden">
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-1">{member.name}</h3>
                <p className="text-primary font-medium text-sm mb-4">{member.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* DNE DIFFERENCE */}
      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
              <span className="eyebrow">The DNE Difference</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8 leading-tight">What makes us different from the other 1,000 IT companies?</h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>Most IT companies are reactive. They wait for something to break, then they fix it. Most development agencies are transactional.</p>
                <p>DNE operates as an extension of your business. We proactively look for ways to use technology to increase your margins, speed up your operations, and secure your data.</p>
                <p>By combining AI automation, software engineering, and managed IT under one roof, we eliminate the vendor finger-pointing that plagues modern businesses. One partner. Total accountability.</p>
              </div>
            </motion.div>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="space-y-6">
              {statsData.map((stat, index) => (
                <motion.div key={index} variants={itemVariant}>
                  <div className="bg-card p-6 md:p-8 border-t-2 border-t-primary rounded-b-xl shadow-lg flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:-translate-y-1 transition-transform duration-300">
                    <span className="text-4xl md:text-5xl font-bold text-foreground tracking-tight whitespace-nowrap w-full sm:w-1/3">{stat.value}</span>
                    <span className="text-muted-foreground text-base md:text-lg leading-snug sm:w-2/3">{stat.label}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bg-primary py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">Ready to work with a team that actually delivers?</h2>
            <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">Tell us about your project. We'll tell you exactly how we can help — and what we can't. No sales pitch, just a straight conversation.</p>
            <Link href="/contact" className="inline-block w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-background text-foreground hover:bg-background/90 text-base px-10 py-7 active:scale-[0.98] transition-transform shadow-xl">
                Start the Conversation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
