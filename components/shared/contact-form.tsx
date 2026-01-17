"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  reason: z.enum(["ai-transformation", "ai-engineer", "education", "reselling"], {
    required_error: "Please select a reason for the call",
  }),
  email: z.string().email("Please enter a valid email address"),
  decisionMaker: z.string().min(1, "Please answer this question"),
  revenue: z.string().min(1, "Please select your annual revenue"),
  description: z.string().min(20, "Please provide at least 20 characters of detail"),
});

type FormData = z.infer<typeof formSchema>;

const reasonOptions = [
  { value: "ai-transformation", label: "AI Transformation" },
  { value: "ai-engineer", label: "Developing custom AI solutions / AI Engineer" },
  { value: "education", label: "Educating your team on AI" },
  { value: "reselling", label: "Re-selling/white-label your solutions" },
];

const revenueOptions = [
  "Less than $100K",
  "$100K - $500K",
  "$500K - $1M",
  "$1M - $5M",
  "$5M - $10M",
  "$10M+",
  "Prefer not to say",
];

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      setSubmitStatus({
        type: "success",
        message: "Thank you for your submission! We'll get back to you soon.",
      });
      reset();
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Failed to send message. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Logo */}
      <div className="flex justify-center">
        <Image
          src="/intraweb-logo-white.png"
          alt="IntraWeb Technologies"
          width={240}
          height={60}
          className="h-14 w-auto"
        />
      </div>

      {/* Headline */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold">
          Ready to transform your business?
        </h2>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Request a diagnostic to bridge the gap between strategy and execution. We provide the specialized engineering firepower and architectural guidance you need to turn AI concepts into high-impact production systems.
        </p>

      </div>

      {/* Value Props */}
      <div className="space-y-2 text-gray-300">
        <p className="flex items-start">
          <span className="text-teal-400 mr-2">→</span>
          <span>Identify and resolve the structural bottlenecks limiting your AI adoption</span>
        </p>
        <p className="flex items-start">
          <span className="text-teal-400 mr-2">→</span>
          <span>Bypass recruitment cycles with immediate access to senior AI systems engineers</span>
        </p>
        <p className="flex items-start">
          <span className="text-teal-400 mr-2">→</span>
          <span>Ship robust, custom infrastructure tailored to your specific operational reality</span>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {submitStatus && (
          <div
            className={`p-4 rounded-md ${submitStatus.type === "success"
              ? "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400"
              : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
              }`}
          >
            {submitStatus.message}
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-1">
              First Name <span className="text-red-400">*</span>
            </label>
            <input
              {...register("firstName")}
              type="text"
              id="firstName"
              className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="First Name"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-1">
              Last Name <span className="text-red-400">*</span>
            </label>
            <input
              {...register("lastName")}
              type="text"
              id="lastName"
              className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Last Name"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-200 mb-1">
            Please provide your website <span className="text-red-400">*</span>
          </label>
          <input
            {...register("website")}
            type="url"
            id="website"
            className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="https://yourcompany.com"
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-400">{errors.website.message}</p>
          )}
        </div>

        {/* Reason for Call */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-200 mb-2">
            Which best describes the reason for the call? <span className="text-red-400">*</span>
          </label>
          <div className="space-y-3">
            {reasonOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-start p-3 rounded-md bg-gray-800 border border-gray-700 hover:border-teal-500 cursor-pointer transition-colors"
              >
                <input
                  {...register("reason")}
                  type="radio"
                  value={option.value}
                  className="mt-1 mr-3 text-teal-500 focus:ring-teal-500"
                />
                <span className="text-white">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.reason && (
            <p className="mt-1 text-sm text-red-400">{errors.reason.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
            What is your email? <span className="text-red-400">*</span>
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="your.email@company.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Decision Maker */}
        <div>
          <label htmlFor="decisionMaker" className="block text-sm font-medium text-gray-200 mb-1">
            Are you the only decision maker? If no, please invite anybody else who may be in charge of making decision. <span className="text-red-400">*</span>
          </label>
          <input
            {...register("decisionMaker")}
            type="text"
            id="decisionMaker"
            className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Yes, I'm the only decision maker / No, please include..."
          />
          {errors.decisionMaker && (
            <p className="mt-1 text-sm text-red-400">{errors.decisionMaker.message}</p>
          )}
        </div>

        {/* Annual Revenue */}
        <div>
          <label htmlFor="revenue" className="block text-sm font-medium text-gray-200 mb-1">
            Annual Revenue <span className="text-red-400">*</span>
          </label>
          <select
            {...register("revenue")}
            id="revenue"
            className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Select revenue range</option>
            {revenueOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.revenue && (
            <p className="mt-1 text-sm text-red-400">{errors.revenue.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-1">
            Please describe what you're looking for - please provide as much detail as possible <span className="text-red-400">*</span>
          </label>
          <textarea
            {...register("description")}
            id="description"
            rows={6}
            className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Tell us about your business challenges, goals, and what you're hoping to achieve with AI..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-6 py-3 rounded-md bg-orange-500 text-white font-semibold hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              Submitting...
            </>
          ) : (
            "Submit Request"
          )}
        </button>
      </form>
    </div>
  );
}