"use client";
import Link from "next/link";
import Image from "next/image";
import { Mail, Linkedin, Github, Facebook } from "lucide-react";
import { dispatchOpenCookiePreferences } from "./CookieConsentBanner";

export function Footer() {
  return (
    <footer className="w-full bg-gray-700 text-gray-200">
      {/* Mobile Footer */}
      <div className="md:hidden py-6 px-4">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo and Tagline */}
          <div className="text-center">
            <Image src="/intraweb-logo-white.png" alt="IntraWeb Technologies Logo" width={128} height={48} className="mx-auto mb-2 w-32 h-auto" loading="lazy" />
            <p className="text-sm font-medium">Implementation for AI-enabled operations</p>
          </div>

          {/* Contact Information */}
          <div className="text-center space-y-2">
            <p className="text-sm">
              <a href="mailto:human@intrawebtech.com" className="hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-700 rounded">
                human@intrawebtech.com
              </a>
            </p>
            <p className="text-sm">Based in New Jersey</p>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center space-x-6">
            <a 
              href="https://linkedin.com" 
              aria-label="LinkedIn" 
              className="hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-700 rounded"
            >
              <Linkedin size={24} />
            </a>
            <a 
              href="https://facebook.com" 
              aria-label="Facebook" 
              className="hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-700 rounded"
            >
              <Facebook size={24} />
            </a>
            <a 
              href="https://threads.net" 
              aria-label="Threads" 
              className="hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-700 rounded"
            >
              <Mail size={24} />
            </a>
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
                Terms
              </Link>
              <Link 
                href="/accessibility" 
                className="hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-700 rounded"
              >
                Accessibility
              </Link>
              <button
                type="button"
                onClick={dispatchOpenCookiePreferences}
                className="hover:text-orange-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-700 rounded"
              >
                Cookie Preferences
              </button>
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
      <div className="hidden md:block py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            {/* Column 1 */}
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <Image src="/intraweb-logo-white.png" alt="IntraWeb Technologies Logo" width={128} height={48} className="mb-2 w-32 h-auto" loading="lazy" />
              <p className="text-sm">Implementation for AI-enabled operations</p>
              <p className="text-xs">We help SMBs turn AI tool adoption into actual operational savings.</p>
            </div>
            {/* Column 2 */}
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
              <nav className="flex flex-col space-y-1">
                {/* <Link href="/work" className="hover:text-orange-500">Work</Link> */}
                <Link href="/process" className="hover:text-orange-500">Process</Link>
                <Link href="/about" className="hover:text-orange-500">About</Link>
                <Link href="/careers" className="hover:text-orange-500">Careers</Link>
              </nav>
            </div>
            {/* Column 3 */}
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Contact</h3>
              <p className="text-sm">Email: <a href="mailto:human@intrawebtech.com" className="hover:text-orange-500">human@intrawebtech.com</a></p>
              <p className="text-sm">Based in New Jersey</p>
            </div>
            {/* Column 4 */}
            <div className="w-full md:w-1/4">
              <h3 className="text-lg font-semibold mb-2">Follow us</h3>
              <div className="flex space-x-4">
                <a href="https://linkedin.com" aria-label="LinkedIn" className="hover:text-orange-500"><Linkedin /></a>
                <a href="https://facebook.com" aria-label="Facebook" className="hover:text-orange-500"><Facebook /></a>
                <a href="https://github.com" aria-label="GitHub" className="hover:text-orange-500"><Github /></a>
                <a href="https://threads.net" aria-label="Threads" className="hover:text-orange-500"><Mail /></a>
              </div>
            </div>
          </div>
          <div className="text-xs text-center mt-8">
            &copy; {new Date().getFullYear()} IntraWeb Technologies LLC |{' '}
            <Link href="/privacy-policy" className="hover:text-orange-500">Privacy Policy</Link> |{' '}
            <Link href="/terms-of-service" className="hover:text-orange-500">Terms</Link> |{' '}
            <Link href="/accessibility" className="hover:text-orange-500">Accessibility</Link> |{' '}
            <button
                type="button"
                onClick={dispatchOpenCookiePreferences}
                className="hover:text-orange-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-700 rounded"
              >
                Cookie Preferences
              </button>
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