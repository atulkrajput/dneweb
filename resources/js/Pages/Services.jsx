import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import PublicLayout from '@/Layouts/PublicLayout';

function ServiceSection({ id, tag, title, subtitle, description, checklist, callout, image, buttonText, buttonLink, reverse, isFirst }) {
  // Append Unsplash optimization params if it's an Unsplash URL without them
  const optimizedImage = image && image.includes('unsplash.com') && !image.includes('?')
    ? `${image}?w=800&q=70&auto=format`
    : image;

  return (
    <section id={`service-${id}`} className={`section-padding ${reverse ? 'bg-secondary' : 'bg-background'} overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>
          <motion.div initial={{ opacity: 0, x: reverse ? 40 : -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="w-full lg:w-1/2 relative">
            <div className="aspect-[4/3] lg:aspect-square relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-background/20 z-10 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
              <img
                src={optimizedImage}
                alt={`${title} representation`}
                className="w-full h-full object-cover"
                loading={isFirst ? "eager" : "lazy"}
                decoding="async"
                width="800"
                height="800"
              />
            </div>
            <div className={`absolute -z-10 top-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[100px] ${reverse ? '-right-1/4' : '-left-1/4'}`} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }} className="w-full lg:w-1/2">
            <span className="eyebrow">{tag}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">{title}</h2>
            <p className="text-xl sm:text-2xl text-primary font-medium mb-6">{subtitle}</p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">{description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {(checklist || []).map((item, index) => (
                <div key={index} className="checklist-card">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-foreground/90">{item}</span>
                </div>
              ))}
            </div>
            <div className="callout-box mb-10">
              <p><strong>Who this is for:</strong> {callout}</p>
            </div>
            <Link href={buttonLink || '/contact'} className="w-full sm:w-auto inline-block">
              <Button size="lg" className="w-full sm:w-auto btn-secondary text-base px-8 py-6">
                {buttonText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function Services({ page, services }) {
  const seo = page || {};

  const defaultServices = [
    {
      id: "ai-automation", tag: "01 / AUTOMATION-FIRST", title: "AI & Automation", subtitle: "Let AI do the heavy lifting.",
      description: "The most successful businesses today aren't working harder — they're automating smarter. DNE designs and deploys custom AI automation solutions that eliminate repetitive tasks, reduce errors, and free your team for high-value work.",
      checklist: ["AI workflow automation (n8n, Make, Zapier + custom builds)", "Custom AI agents for sales, customer service, and operations", "Document processing and data extraction automation", "LLM-powered chatbot and virtual assistant development", "CRM and tool integration automation", "Business intelligence dashboards powered by AI"],
      callout: "Growing businesses spending too much time on manual processes, data entry, or customer queries that a well-built AI system can handle end-to-end.",
      image: "https://images.unsplash.com/photo-1678995635432-d9e89c7a8fc5", buttonText: "Get an Automation Audit", buttonLink: "/contact", reverse: false
    },
    {
      id: "product-engineering", tag: "02 / PRODUCT ENGINEERING", title: "AI & SaaS Products", subtitle: "From idea to live product — engineered to scale.",
      description: "Building a SaaS product isn't just about writing code. It's about creating a reliable, secure, scalable platform that your users love and your business can grow on.",
      checklist: ["Custom SaaS application development (web-based platforms)", "AI feature integration (LLMs, computer vision, engines)", "API development and third-party integrations", "Product roadmapping and technical architecture", "Secure cloud deployment and DevOps", "Post-launch maintenance and feature iteration"],
      callout: "Entrepreneurs building software products, businesses creating internal tools, and companies looking to productize their AI capabilities.",
      image: "https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b", buttonText: "Start Your Product Conversation", buttonLink: "/contact", reverse: true
    },
    {
      id: "digital-engineering", tag: "03 / DIGITAL ENGINEERING", title: "Web & Mobile Development", subtitle: "Your digital presence, engineered for performance.",
      description: "Your website and mobile app are often the first things a client sees — and the last chance to make a great impression. DNE builds modern, fast, and conversion-focused digital products.",
      checklist: ["Business websites and corporate portals", "E-commerce platforms (Shopify, WooCommerce, custom)", "Progressive Web Apps (PWA)", "iOS and Android mobile application development", "UI/UX design and prototyping", "Website speed optimization and SEO technical foundation", "CMS integration (WordPress, headless CMS)"],
      callout: "Businesses that need a website or app that actually drives results — not just a digital brochure.",
      image: "https://images.unsplash.com/photo-1624388611710-bdf95023d1c2", buttonText: "Share Your Project Brief", buttonLink: "/contact", reverse: false
    },
    {
      id: "infrastructure-support", tag: "04 / INFRASTRUCTURE & SUPPORT", title: "IT & Managed Services", subtitle: "Secure. Scalable. Always on.",
      description: "Your technology infrastructure is the foundation everything else runs on. DNE provides enterprise-grade IT consulting and managed services.",
      checklist: ["Cloud infrastructure setup and migration (AWS, Azure, GCP)", "Network design, monitoring, and management", "Cybersecurity assessments and implementation", "IT helpdesk and managed support", "Systems integration and legacy modernisation", "Backup, disaster recovery, and continuity planning", "Microsoft 365 / Google Workspace administration"],
      callout: "Small to mid-size businesses that need reliable IT support, companies migrating to the cloud, and organisations that want proactive technology management.",
      image: "https://images.unsplash.com/photo-1506399558188-acca6f8cbf41", buttonText: "Book an IT Assessment", buttonLink: "/contact", reverse: true
    }
  ];

  const servicesData = services || defaultServices;

  return (
    <PublicLayout>
      <Head title={seo.meta_title || 'AI, Automation & Software Development Services | DNE Consultants'} />

      {/* HERO */}
      <section className="relative pt-10 pb-12 md:pt-12 md:pb-14 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 z-0 bg-background" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50 transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen opacity-50" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <span className="eyebrow inline-block">Our Capabilities</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight" style={{ letterSpacing: '-0.02em' }}>
              Modern technology services for businesses that want to grow.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
              We combine AI, automation, software engineering, and IT management into one seamless partnership — so you can focus on your business while we build the systems behind it.
            </p>
            <Link href="/contact" className="inline-block w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto btn-primary text-base px-10 py-6">
                Talk to Our Team
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SERVICE SECTIONS */}
      {servicesData.map((service, index) => (
        <ServiceSection key={service.id} {...service} isFirst={index === 0} />
      ))}

      {/* BOTTOM CTA */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-background border-t border-border/40">
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <div className="w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="eyebrow inline-block">One Partner. Four Disciplines.</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">Why manage four vendors when one team can do it all?</h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
              The real advantage of working with DNE is integration. Our AI team talks to our development team. Our IT team connects to our automation team. Nothing falls between the cracks.
            </p>
            <Link href="/contact" className="inline-block w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto btn-primary text-base px-10 py-6">
                Let's Talk
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
