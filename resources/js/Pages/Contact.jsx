import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Clock, Facebook, Instagram, Linkedin, ArrowRight, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { Button } from '@/Components/ui/button';
import PublicLayout from '@/Layouts/PublicLayout';

export default function Contact({ page }) {
  const seo = page || {};
  const { settings = {} } = usePage().props;

  const { data, setData, post, processing, errors, reset } = useForm({
    full_name: '',
    email: '',
    company: '',
    inquiry_type: '',
    message: ''
  });

  const [clientErrors, setClientErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!data.full_name.trim()) newErrors.full_name = "Full name is required";
    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!data.inquiry_type) newErrors.inquiry_type = "Please select an inquiry type";
    setClientErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    post('/contact', {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Message sent successfully!", {
          description: "We'll be in touch within 1 business day.",
        });
        reset();
        setClientErrors({});
      },
      onError: () => {
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(name, value);
    if (clientErrors[name]) {
      setClientErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const processSteps = [
    { number: "01", title: "We review your brief", description: "We read everything you send and come to the first call prepared — no generic questions." },
    { number: "02", title: "Discovery call (30 min)", description: "A straight conversation about your goals, constraints, and the best technology approach. No sales pitch." },
    { number: "03", title: "Proposal & scope", description: "We send a clear, detailed proposal within 3–5 business days. No hidden costs, no vague estimates." },
    { number: "04", title: "We get to work", description: "Once you're happy to proceed, we onboard your project and start building immediately." }
  ];

  const email = settings.contact_email || 'build@dnetechnology.com';
  const location = settings.company_location || 'Chicago, IL, USA';

  return (
    <PublicLayout>
      <Head>
        <title>{seo.meta_title || 'Contact DNE Consultants | Start Your Project'}</title>
        <meta name="description" content={seo.meta_description || "Get in touch with DNE Consultants. We respond within 1 business day."} />
      </Head>

      <Toaster theme="dark" position="bottom-right" />

      {/* HERO */}
      <section className="relative pt-16 pb-12 lg:pt-20 lg:pb-16 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1606822096762-8805b2db0878" alt="Workspace Background" className="w-full h-full object-cover opacity-[0.05] mix-blend-screen grayscale" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background to-background" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <span className="eyebrow inline-block">Get In Touch</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6" style={{ letterSpacing: '-0.02em' }}>Let's talk about what you're building.</h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Whether you have a detailed brief or just an idea on a napkin — we're happy to have an honest conversation about how DNE can help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* MAIN CONTACT SECTION */}
      <section id="contact-form" className="py-12 md:py-16 bg-background relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12">
            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="lg:col-span-7">
              <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-10 shadow-xl shadow-black/20">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="full_name" className="form-label">Full Name <span className="text-primary">*</span></label>
                      <input type="text" id="full_name" name="full_name" value={data.full_name} onChange={handleChange} className={`form-input ${clientErrors.full_name || errors.full_name ? 'border-destructive focus-visible:ring-destructive' : ''}`} placeholder="Jane Doe" />
                      {(clientErrors.full_name || errors.full_name) && <p className="mt-1 text-sm text-destructive">{clientErrors.full_name || errors.full_name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="form-label">Business Email <span className="text-primary">*</span></label>
                      <input type="email" id="email" name="email" value={data.email} onChange={handleChange} className={`form-input ${clientErrors.email || errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`} placeholder="jane@company.com" />
                      {(clientErrors.email || errors.email) && <p className="mt-1 text-sm text-destructive">{clientErrors.email || errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="company" className="form-label">Company Name</label>
                    <input type="text" id="company" name="company" value={data.company} onChange={handleChange} className="form-input" placeholder="Your Company Ltd" />
                  </div>
                  <div>
                    <label htmlFor="inquiry_type" className="form-label">What are you looking for? <span className="text-primary">*</span></label>
                    <div className="relative">
                      <select id="inquiry_type" name="inquiry_type" value={data.inquiry_type} onChange={handleChange} className={`form-input appearance-none ${clientErrors.inquiry_type || errors.inquiry_type ? 'border-destructive focus-visible:ring-destructive' : ''}`}>
                        <option value="" disabled>Select an option...</option>
                        <option value="ai-automation">AI & Automation</option>
                        <option value="saas-products">AI & SaaS Products</option>
                        <option value="web-mobile">Web & Mobile Development</option>
                        <option value="it-managed">IT & Managed Services</option>
                        <option value="not-sure">Not sure yet — let's talk</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                      </div>
                    </div>
                    {(clientErrors.inquiry_type || errors.inquiry_type) && <p className="mt-1 text-sm text-destructive">{clientErrors.inquiry_type || errors.inquiry_type}</p>}
                  </div>
                  <div>
                    <label htmlFor="message" className="form-label">Tell us about your project</label>
                    <textarea id="message" name="message" rows="5" value={data.message} onChange={handleChange} className="form-input resize-y" placeholder="What's the current challenge? What does success look like?"></textarea>
                  </div>
                  <div className="pt-2">
                    <Button type="submit" size="lg" className="w-full btn-primary text-base py-6" disabled={processing}>
                      {processing ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Sending...</>) : (<>Send Message<ArrowRight className="ml-2 h-5 w-5" /></>)}
                    </Button>
                    <p className="mt-4 text-center text-sm text-muted-foreground italic">We respond to all enquiries within 1 business day.</p>
                  </div>
                </form>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-5 flex flex-col pt-4 lg:pt-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-10">Or reach us directly</h2>
              <div className="space-y-10 mb-16">
                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors"><Mail className="h-6 w-6 text-primary" /></div>
                  <div><h3 className="text-lg font-semibold text-foreground mb-1">Email</h3><a href={`mailto:${email}`} className="text-muted-foreground hover:text-primary transition-colors">{email}</a></div>
                </div>
                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors"><MapPin className="h-6 w-6 text-primary" /></div>
                  <div><h3 className="text-lg font-semibold text-foreground mb-1">Headquarters</h3><p className="text-muted-foreground">{location}</p></div>
                </div>
                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors"><Clock className="h-6 w-6 text-primary" /></div>
                  <div><h3 className="text-lg font-semibold text-foreground mb-1">Response Time</h3><p className="text-muted-foreground leading-relaxed">We respond to all enquiries within 1 business day. No automated replies, just real people.</p></div>
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4">Follow our work:</h3>
                <div className="flex gap-4">
                  {[
                    { icon: Facebook, href: settings.facebook_url || 'https://facebook.com/dneconsultants', label: 'Facebook' },
                    { icon: Instagram, href: settings.instagram_url || 'https://instagram.com/dneconsultants', label: 'Instagram' },
                    { icon: Linkedin, href: settings.linkedin_url || 'https://linkedin.com/company/dnetechnologyconsultants-', label: 'LinkedIn' },
                  ].map((social) => (
                    <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 shadow-sm" aria-label={social.label}>
                      <social.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="section-padding bg-secondary overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
            <span className="eyebrow">The Process</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">What happens after you reach out.</h2>
          </motion.div>
          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-[2px] bg-border z-0" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
              {processSteps.map((step, index) => (
                <motion.div key={step.number} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: index * 0.15 }} className="flex flex-col items-center lg:items-start text-center lg:text-left group">
                  <div className="w-16 h-16 rounded-full bg-card border-2 border-primary flex items-center justify-center text-xl font-bold text-primary mb-6 shadow-[0_0_15px_rgba(255,107,53,0.15)] group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110">{step.number}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
