import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Facebook, Instagram, Linkedin, Twitter, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const { settings = {} } = usePage().props;

  const navigationLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About DNE', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const servicesList = [
    'AI & Automation',
    'AI & SaaS Products',
    'Web & Mobile Development',
    'IT & Managed Services',
  ];

  const socialLinks = [
    { icon: Facebook, href: settings.facebook_url || 'https://facebook.com/dneconsultants', label: 'Facebook' },
    { icon: Instagram, href: settings.instagram_url || 'https://instagram.com/dneconsultants', label: 'Instagram' },
    { icon: Linkedin, href: settings.linkedin_url || 'https://linkedin.com/company/dnetechnologyconsultants-', label: 'LinkedIn' },
    { icon: Twitter, href: settings.twitter_url || '#', label: 'Twitter' },
  ];

  const email = settings.contact_email || 'build@dnetechnology.com';
  const location = settings.company_location || 'Chicago, IL';
  const tagline = settings.footer_tagline || 'Technology that works. Results you can measure.';

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <img src="/logo-white.png" alt="DNE Consultants" className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {tagline}
            </p>
          </div>

          <div>
            <span className="text-sm font-semibold text-foreground mb-6 block">Navigation</span>
            <ul className="space-y-4">
              {navigationLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-sm font-semibold text-foreground mb-6 block">Services</span>
            <ul className="space-y-4">
              {servicesList.map((service) => (
                <li key={service}>
                  <span className="text-sm text-muted-foreground">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-sm font-semibold text-foreground mb-6 block">Get in Touch</span>
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3 group">
                <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="text-sm text-muted-foreground group-hover:text-primary transition-colors duration-200"
                >
                  {email}
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{location}</span>
              </div>
            </div>

            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith('http') ? "_blank" : "_self"}
                  rel={social.href.startsWith('http') ? "noopener noreferrer" : ""}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 shadow-sm"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DNE Technology Consultants. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/page/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/page/terms-of-service" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
