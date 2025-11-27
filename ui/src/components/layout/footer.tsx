import { footerColumnApi } from '@/lib/api/footer-menu.api';
import settingsApi from '@/lib/api/settings.api';
import { Brain, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';


export default async function Footer() {

  const [footerRes, settings] = await Promise.all([
    footerColumnApi.getAll({ includeItems: true }).catch(() => null),
    settingsApi.getSettings()
  ]);

  const columns = footerRes?.data || [];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: settings?.socialFacebook },
    { name: "Twitter", icon: Twitter, href: settings?.socialTwitter },
    { name: "Instagram", icon: Instagram, href: settings?.socialInstagram },
    { name: "LinkedIn", icon: Linkedin, href: settings?.socialLinkedin },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="bg-primary p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">MasomoAI</span>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
              Empowering students worldwide with AI-powered homework assistance.
              Get instant, accurate solutions across all subjects with step-by-step explanations.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-purple-400" />
                <span className="text-gray-400">{settings?.supportEmail}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-purple-400" />
                <span className="text-gray-400">{settings?.contactPhone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-purple-400" />
                <span className="text-gray-400">{settings?.contactAddress}</span>
              </div>
            </div>
          </div>

          {
            columns.map((column) => (
              <div key={column.columnId}>
                <h3 className="text-lg font-semibold mb-6">{column.title}</h3>
                <ul className="space-y-3">
                  {column.items?.map((item) => (
                    <li key={item.itemId}>
                      <Link
                        href={`/ai-tutor/${item.url}`}
                        target={item.target || '_self'}
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          }
        </div>

        {/* Newsletter Signup */}
        {/* <div className="border-t border-gray-800 mt-12 pt-12">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Get the latest updates on new features, study tips, and educational content.
            </p>
            <div className="flex space-x-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white placeholder-gray-400"
              />
              <button className="px-6 py-2 bg-primary rounded-lg font-medium hover:bg-primary/90 transition-all duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div> */}
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} MasomoAI. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.filter(social => social.href).map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}