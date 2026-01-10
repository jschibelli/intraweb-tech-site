"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Linkedin, Github, Facebook } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Honeypot field
    const honeypot = document.getElementById("honeypot") as HTMLInputElement;
    if (honeypot && honeypot.value) return;
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setMessage("Thank you for subscribing!");
      } else {
        setMessage("Subscription failed. Please try again.");
      }
    } catch {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <footer className="w-full bg-gray-700 text-gray-200">
      {/* Mobile Footer */}
      <div className="md:hidden py-6 px-4">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo and Tagline */}
          <div className="text-center">
            <Image src="/intraweb-logo-white.png" alt="IntraWeb Technologies Logo" width={128} height={40} className="mx-auto mb-2 w-32 h-auto" />
            <p className="text-sm font-medium">Empowering Digital Innovation</p>
          </div>

          {/* Contact Information */}
          <div className="text-center space-y-2">
            <p className="text-sm">Towaco, NJ</p>
            <p className="text-sm">
              <a href="mailto:info@intrawebtech.com" className="hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-700 rounded">
                info@intrawebtech.com
              </a>
            </p>
            <p className="text-sm">(862) 207-9004</p>
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

          {/* Newsletter Signup */}
          <form onSubmit={handleSubscribe} className="w-full max-w-xs space-y-2">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
                suppressHydrationWarning
              />
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-700"
              >
                Subscribe
              </button>
            </div>
            <input type="text" id="honeypot" className="hidden" />
            <div aria-live="polite" className="text-sm text-orange-500 text-center">{message}</div>
          </form>

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
      <div className="hidden md:block py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            {/* Column 1 */}
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <Image src="/intraweb-logo-white.png" alt="IntraWeb Technologies Logo" width={128} height={40} className="mb-2 w-32 h-auto" />
              <p className="text-sm">Innovate. Build. Empower.</p>
              <p className="text-xs">We are committed to delivering innovative<br />solutions that empower businesses worldwide.</p>
            </div>
            {/* Column 2 */}
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
              <nav className="flex flex-col space-y-1">
                <Link href="/services" className="hover:text-orange-500">Services</Link>
                {/* <Link href="/work" className="hover:text-orange-500">Work</Link> */}
                <Link href="/process" className="hover:text-orange-500">Process</Link>
                <Link href="/about" className="hover:text-orange-500">About</Link>
                <Link href="/team" className="hover:text-orange-500">Team</Link>
                <Link href="/careers" className="hover:text-orange-500">Careers</Link>
              </nav>
            </div>
            {/* Column 3 */}
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Contact</h3>
              <p className="text-sm">Email: <a href="mailto:info@intrawebtech.com" className="hover:text-orange-500">info@intrawebtech.com</a></p>
              <p className="text-sm">Phone: (862) 207-9004</p>
              <p className="text-sm">Location: Towaco, New Jersey</p>
            </div>
            {/* Column 4 */}
            <div className="w-full md:w-1/4">
              <h3 className="text-lg font-semibold mb-2">Stay Connected</h3>
              <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="p-2 rounded bg-gray-800 text-white"
                  required
                  suppressHydrationWarning
                />
                <input type="text" id="honeypot" className="hidden" />
                <button type="submit" className="p-2 bg-orange-500 text-white rounded hover:bg-orange-600">Subscribe</button>
                <div aria-live="polite" className="text-sm text-orange-500">{message}</div>
              </form>
              <div className="flex space-x-4 mt-4">
                <a href="https://linkedin.com" aria-label="LinkedIn" className="hover:text-orange-500"><Linkedin /></a>
                <a href="https://facebook.com" aria-label="Facebook" className="hover:text-orange-500"><Facebook /></a>
                <a href="https://github.com" aria-label="GitHub" className="hover:text-orange-500"><Github /></a>
                <a href="https://threads.net" aria-label="Threads" className="hover:text-orange-500"><Mail /></a>
              </div>
            </div>
          </div>
          <div className="text-xs text-center mt-8">
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