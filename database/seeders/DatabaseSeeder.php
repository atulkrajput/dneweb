<?php

namespace Database\Seeders;

use App\Models\Page;
use App\Models\Service;
use App\Models\Setting;
use App\Models\LegalPage;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::updateOrCreate(
            ['email' => 'admin@dneconsultants.com'],
            [
                'name' => 'Admin',
                'password' => 'password',
                'team_role' => 'super_admin',
                'email_verified_at' => now(),
            ]
        );

        // Settings
        $settings = [
            ['group' => 'contact', 'key' => 'contact_email', 'value' => 'build@dnetechnology.com'],
            ['group' => 'contact', 'key' => 'company_location', 'value' => 'Chicago, IL, USA'],
            ['group' => 'social', 'key' => 'facebook_url', 'value' => 'https://facebook.com/dneconsultants'],
            ['group' => 'social', 'key' => 'instagram_url', 'value' => 'https://instagram.com/dneconsultants'],
            ['group' => 'social', 'key' => 'linkedin_url', 'value' => 'https://linkedin.com/company/dnetechnologyconsultants-'],
            ['group' => 'social', 'key' => 'twitter_url', 'value' => ''],
            ['group' => 'general', 'key' => 'footer_tagline', 'value' => 'Technology that works. Results you can measure.'],
            ['group' => 'pages', 'key' => 'about_show_team', 'value' => '1'],
            ['group' => 'tracking', 'key' => 'ga4_id', 'value' => ''],
            ['group' => 'tracking', 'key' => 'gtm_id', 'value' => ''],
            ['group' => 'tracking', 'key' => 'meta_pixel', 'value' => ''],
            ['group' => 'tracking', 'key' => 'header_scripts', 'value' => ''],
            ['group' => 'tracking', 'key' => 'footer_scripts', 'value' => ''],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }

        // Pages SEO
        $pages = [
            ['slug' => 'home', 'meta_title' => 'AI Automation & Technology Solutions | DNE Consultants', 'meta_description' => 'DNE Consultants delivers AI automation, SaaS products, web and mobile apps, and managed IT services that help businesses work smarter and scale securely.'],
            ['slug' => 'services', 'meta_title' => 'AI, Automation & Software Development Services | DNE Consultants', 'meta_description' => "Explore DNE's services — AI automation, SaaS products, web & mobile development, and managed IT. Modern technology built for business growth."],
            ['slug' => 'about', 'meta_title' => 'About DNE Consultants | AI & Technology Partner', 'meta_description' => 'DNE Consultants is an execution-first technology partner specialising in AI, automation, software, and IT. Senior team. No handoffs. Real accountability.'],
            ['slug' => 'contact', 'meta_title' => 'Contact DNE Consultants | Start Your Project', 'meta_description' => 'Get in touch with DNE Consultants. We respond within 1 business day. AI, automation, development, and IT services for businesses ready to grow.'],
        ];

        foreach ($pages as $page) {
            Page::updateOrCreate(['slug' => $page['slug']], $page);
        }

        // Services
        $services = [
            [
                'slug' => 'ai-automation',
                'tag' => '01 / AUTOMATION-FIRST',
                'title' => 'AI & Automation',
                'subtitle' => 'Let AI do the heavy lifting.',
                'description' => "The most successful businesses today aren't working harder — they're automating smarter. DNE designs and deploys custom AI automation solutions that eliminate repetitive tasks, reduce errors, and free your team for high-value work. We build automation that connects to your existing tools — your CRM, ERP, customer support stack — and makes them work together without manual intervention.",
                'checklist' => ['AI workflow automation (n8n, Make, Zapier + custom builds)', 'Custom AI agents for sales, customer service, and operations', 'Document processing and data extraction automation', 'LLM-powered chatbot and virtual assistant development', 'CRM and tool integration automation', 'Business intelligence dashboards powered by AI'],
                'callout' => 'Growing businesses spending too much time on manual processes, data entry, or customer queries that a well-built AI system can handle end-to-end.',
                'image' => 'https://images.unsplash.com/photo-1678995635432-d9e89c7a8fc5',
                'button_text' => 'Get an Automation Audit',
                'button_link' => '/contact',
                'icon' => 'Bot',
                'sort_order' => 0,
            ],
            [
                'slug' => 'product-engineering',
                'tag' => '02 / PRODUCT ENGINEERING',
                'title' => 'AI & SaaS Products',
                'subtitle' => 'From idea to live product — engineered to scale.',
                'description' => "Building a SaaS product isn't just about writing code. It's about creating a reliable, secure, scalable platform that your users love and your business can grow on. DNE takes your product vision and turns it into a commercial-grade application — with AI capabilities built in from day one.",
                'checklist' => ['Custom SaaS application development (web-based platforms)', 'AI feature integration (LLMs, computer vision, engines)', 'API development and third-party integrations', 'Product roadmapping and technical architecture', 'Secure cloud deployment and DevOps', 'Post-launch maintenance and feature iteration'],
                'callout' => 'Entrepreneurs building software products, businesses creating internal tools, and companies looking to productize their AI capabilities.',
                'image' => 'https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b',
                'button_text' => 'Start Your Product Conversation',
                'button_link' => '/contact',
                'icon' => 'Layers',
                'sort_order' => 1,
            ],
            [
                'slug' => 'digital-engineering',
                'tag' => '03 / DIGITAL ENGINEERING',
                'title' => 'Web & Mobile Development',
                'subtitle' => 'Your digital presence, engineered for performance.',
                'description' => "Your website and mobile app are often the first things a client sees — and the last chance to make a great impression. DNE builds modern, fast, and conversion-focused digital products that look great and work even better.",
                'checklist' => ['Business websites and corporate portals', 'E-commerce platforms (Shopify, WooCommerce, custom)', 'Progressive Web Apps (PWA)', 'iOS and Android mobile application development', 'UI/UX design and prototyping', 'Website speed optimization and SEO technical foundation', 'CMS integration (WordPress, headless CMS)'],
                'callout' => 'Businesses that need a website or app that actually drives results — not just a digital brochure. Startups, service companies, and enterprises alike.',
                'image' => 'https://images.unsplash.com/photo-1624388611710-bdf95023d1c2',
                'button_text' => 'Share Your Project Brief',
                'button_link' => '/contact',
                'icon' => 'MonitorSmartphone',
                'sort_order' => 2,
            ],
            [
                'slug' => 'infrastructure-support',
                'tag' => '04 / INFRASTRUCTURE & SUPPORT',
                'title' => 'IT & Managed Services',
                'subtitle' => 'Secure. Scalable. Always on.',
                'description' => "Your technology infrastructure is the foundation everything else runs on. If it's fragile, outdated, or poorly managed, every other system suffers. DNE provides enterprise-grade IT consulting and managed services that keep your operations stable, secure, and ready to grow.",
                'checklist' => ['Cloud infrastructure setup and migration (AWS, Azure, GCP)', 'Network design, monitoring, and management', 'Cybersecurity assessments and implementation', 'IT helpdesk and managed support', 'Systems integration and legacy modernisation', 'Backup, disaster recovery, and continuity planning', 'Microsoft 365 / Google Workspace administration'],
                'callout' => 'Small to mid-size businesses that need reliable IT support, companies migrating to the cloud, and organisations that want proactive technology management without the cost of an in-house IT department.',
                'image' => 'https://images.unsplash.com/photo-1506399558188-acca6f8cbf41',
                'button_text' => 'Book an IT Assessment',
                'button_link' => '/contact',
                'icon' => 'Server',
                'sort_order' => 3,
            ],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(['slug' => $service['slug']], $service);
        }

        // Team Members
        $team = [
            ['name' => 'Marcus Chen', 'position' => 'Head of AI & Automation', 'bio' => 'Former enterprise architect specializing in LLM integration and process automation pipelines.', 'sort_order' => 0, 'email' => 'marcus@dneconsultants.com', 'password' => 'password', 'team_role' => 'developer'],
            ['name' => 'Sarah Jenkins', 'position' => 'Lead Product Engineer', 'bio' => 'Full-stack developer with 12+ years building scalable SaaS platforms and custom web applications.', 'sort_order' => 1, 'email' => 'sarah@dneconsultants.com', 'password' => 'password', 'team_role' => 'developer'],
            ['name' => 'David Okafor', 'position' => 'Director of IT Infrastructure', 'bio' => 'Cloud migration expert and cybersecurity specialist managing enterprise-grade networks.', 'sort_order' => 2, 'email' => 'david@dneconsultants.com', 'password' => 'password', 'team_role' => 'project_manager'],
        ];

        foreach ($team as $member) {
            User::updateOrCreate(['name' => $member['name']], $member);
        }

        // Legal Pages
        $legalPages = [
            [
                'slug' => 'privacy-policy',
                'title' => 'Privacy Policy',
                'meta_title' => 'Privacy Policy | DNE Consultants',
                'meta_description' => 'Learn how DNE Consultants collects, uses, stores, and protects personal information when you visit our website, contact our team, or use our services.',
                'content' => '<h2>Introduction</h2><p>DNE Technology Consultants ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p><h2>Information We Collect</h2><p>We may collect personal information that you voluntarily provide to us when you:</p><ul><li>Fill out our contact form</li><li>Subscribe to our newsletter</li><li>Request a consultation</li></ul><p>This information may include your name, email address, company name, and any message you provide.</p><h2>How We Use Your Information</h2><p>We use the information we collect to:</p><ul><li>Respond to your inquiries and provide requested services</li><li>Send you relevant communications about our services</li><li>Improve our website and services</li><li>Comply with legal obligations</li></ul><h2>Data Protection</h2><p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p><h2>Third-Party Services</h2><p>We may use third-party analytics services (such as Google Analytics) to help us understand how our website is used. These services may collect information about your use of our website.</p><h2>Your Rights</h2><p>You have the right to:</p><ul><li>Access the personal data we hold about you</li><li>Request correction of inaccurate data</li><li>Request deletion of your data</li><li>Opt out of marketing communications</li></ul><h2>Contact Us</h2><p>If you have questions about this Privacy Policy, please contact us at <strong>build@dnetechnology.com</strong>.</p>',
            ],
            [
                'slug' => 'terms-of-service',
                'title' => 'Terms of Service',
                'meta_title' => 'Terms of Service | DNE Consultants',
                'meta_description' => 'Read the DNE Consultants Terms of Service covering website use, software services, project agreements, intellectual property, and user responsibilities.',
                'content' => '<h2>Agreement to Terms</h2><p>By accessing or using the DNE Technology Consultants website, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.</p><h2>Services</h2><p>DNE Technology Consultants provides AI automation, SaaS product development, web and mobile development, and IT managed services. Specific service terms will be outlined in individual project agreements.</p><h2>Intellectual Property</h2><p>All content on this website, including text, graphics, logos, and software, is the property of DNE Technology Consultants and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.</p><h2>User Responsibilities</h2><p>When using our website or services, you agree to:</p><ul><li>Provide accurate and complete information</li><li>Not use our services for any unlawful purpose</li><li>Not attempt to gain unauthorized access to our systems</li><li>Not interfere with the proper functioning of our website</li></ul><h2>Limitation of Liability</h2><p>DNE Technology Consultants shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our website or services.</p><h2>Project Agreements</h2><p>All project work will be governed by separate service agreements that outline scope, deliverables, timelines, and payment terms. These Terms of Service apply in addition to any project-specific agreements.</p><h2>Changes to Terms</h2><p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to this page. Your continued use of the website constitutes acceptance of the modified terms.</p><h2>Governing Law</h2><p>These terms shall be governed by the laws of the State of Illinois, United States, without regard to conflict of law provisions.</p><h2>Contact</h2><p>For questions regarding these terms, contact us at <strong>build@dnetechnology.com</strong>.</p>',
            ],
        ];

        foreach ($legalPages as $legalPage) {
            LegalPage::updateOrCreate(['slug' => $legalPage['slug']], $legalPage);
        }
    }
}
