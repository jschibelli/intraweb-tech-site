"use client";
import Link from "next/link";
import { Linkedin, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-gray-700 text-gray-200">
      {/* Mobile Footer */}
      <div className="md:hidden py-6 px-4">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo and Tagline */}
          <div className="text-center">
            <img src="/intraweb-logo-white.png" alt="IntraWeb Technologies Logo" className="mx-auto mb-2 w-32 h-auto" />
            <p className="text-sm font-medium">Empowering Digital Innovation</p>
          </div>

          {/* Social Icons */}
          <div className="flex flex-col items-center space-y-3">
            <h3 className="text-lg font-semibold">Stay Connected</h3>
            <div className="flex justify-center space-x-6">
              <a
                href="https://linkedin.com"
                aria-label="LinkedIn"
                className="hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-700 rounded"
              >
                <Linkedin size={28} />
              </a>
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-700 rounded"
              >
                <Facebook size={28} />
              </a>
            </div>
          </div>

          {/* Copyright and Legal */}
          <div className="text-xs text-center space-y-2">
            <p>&copy; {new Date().getFullYear()} IntraWeb Technologies</p>
            <div className="space-x-4">
              <Link
                href="/privacy-policy"
                className="hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-700 rounded"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-700 rounded"
              >
                Terms of Service
              </Link>
              <Link
                href="/accessibility"
                className="hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-700 rounded"
              >
                Accessibility
              </Link>
            </div>
            <p className="text-gray-400">
              Data Subject Requests: <a
                href="mailto:contact@intrawebtech.com"
                className="hover:text-orange-500"
              >
                contact@intrawebtech.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1 */}
            <div className="flex flex-col">
              <img src="/intraweb-logo-white.png" alt="IntraWeb Technologies Logo" className="mb-4 w-40 h-auto" />
              <p className="text-sm font-medium mb-2">Innovate. Build. Empower.</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                We are committed to delivering innovative<br />solutions that empower businesses worldwide.
              </p>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
              <nav className="flex flex-col space-y-2">
                <Link href="/ai-transformation" className="hover:text-orange-500 transition-colors">AI Transformation</Link>
                <Link href="/ai-engineering" className="hover:text-orange-500 transition-colors">AI Engineering</Link>
                <Link href="/about" className="hover:text-orange-500 transition-colors">About</Link>
                <Link href="/contact" className="hover:text-orange-500 transition-colors">Contact</Link>
                <Link href="/careers" className="hover:text-orange-500 transition-colors text-orange-400 font-medium">Careers</Link>
              </nav>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-white">Stay Connected</h3>
              <p className="text-sm text-gray-400 mb-4">Follow our latest updates and join the conversation.</p>
              <div className="flex space-x-6">
                <a
                  href="https://linkedin.com"
                  aria-label="LinkedIn"
                  className="p-2 bg-gray-600 rounded-full hover:bg-orange-500 transition-all duration-300"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href="https://facebook.com"
                  aria-label="Facebook"
                  className="p-2 bg-gray-600 rounded-full hover:bg-orange-500 transition-all duration-300"
                >
                  <Facebook size={20} />
                </a>
              </div>
            </div>
          </div>

          <div className="text-xs text-center mt-12 pt-8 border-t border-gray-600">
            &copy; {new Date().getFullYear()} IntraWeb Technologies |{' '}
            <Link href="/privacy-policy" className="hover:text-orange-500">Privacy Policy</Link> |{' '}
            <Link href="/terms-of-service" className="hover:text-orange-500">Terms of Service</Link> |{' '}
            <Link href="/accessibility" className="hover:text-orange-500">Accessibility</Link>
            <p className="text-gray-400 mt-2">
              Data Subject Requests: <a
                href="mailto:contact@intrawebtech.com"
                className="hover:text-orange-500"
              >
                contact@intrawebtech.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
