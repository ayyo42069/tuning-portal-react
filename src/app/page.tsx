"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import { ChevronRightIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Slider from "react-slick";

// Import slick carousel styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// SEO metadata is handled in layout.tsx in Next.js 13+

export default function Home() {
  // State for animated counter
  const [count, setCount] = useState({ users: 0, files: 0, satisfaction: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);

  // Refs for scroll animations
  const [heroRef, heroInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const [statsRef, statsInView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });
  const [featuresRef, featuresInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  const [testimonialsRef, testimonialsInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  const [ctaRef, ctaInView] = useInView({ threshold: 0.2, triggerOnce: true });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  // Animate counters when stats section is in view
  useEffect(() => {
    if (statsInView && !hasAnimated) {
      setHasAnimated(true);

      const duration = 2000; // 2 seconds
      const interval = 20; // Update every 20ms
      const steps = duration / interval;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;

        setCount({
          users: Math.floor(progress * 5000),
          files: Math.floor(progress * 25000),
          satisfaction: Math.floor(progress * 98),
        });

        if (step >= steps) clearInterval(timer);
      }, interval);

      return () => clearInterval(timer);
    }
  }, [statsInView, hasAnimated]);

  // Testimonial slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: false,
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Animated Gradient Background Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 animate-gradient-x"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        <div className="container mx-auto py-6 px-4 relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white">Tuning Portal</h1>
            </div>
            <div className="space-x-4">
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-md bg-white text-blue-600 hover:bg-opacity-90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 rounded-md border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Animation */}
      <section className="bg-gradient-to-b from-blue-900 to-blue-800 text-white py-20 lg:py-32 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute w-96 h-96 rounded-full bg-blue-500 opacity-20 -top-20 -left-20 animate-blob"></div>
          <div className="absolute w-96 h-96 rounded-full bg-indigo-500 opacity-20 top-1/3 -right-20 animate-blob animation-delay-2000"></div>
          <div className="absolute w-96 h-96 rounded-full bg-purple-500 opacity-20 bottom-0 left-1/3 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            ref={heroRef}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={itemVariants} className="space-y-8">
              <motion.h2
                variants={itemVariants}
                className="text-5xl lg:text-6xl font-bold leading-tight"
              >
                Unlock Your Vehicle's{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">
                  True Potential
                </span>
              </motion.h2>

              <motion.p
                variants={itemVariants}
                className="text-xl text-blue-100 max-w-lg"
              >
                Professional ECU tuning solutions to enhance performance,
                improve fuel efficiency, and customize your driving experience.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href="/auth/register"
                  className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center group"
                >
                  Get Started
                  <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:ml-3 transition-all duration-300" />
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-4 rounded-lg border border-blue-300 text-white hover:bg-white hover:text-blue-700 transition-all duration-300 font-medium flex items-center group"
                >
                  Learn More
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:ml-3 transition-all duration-300" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-4/5 h-4/5 rounded-xl overflow-hidden shadow-2xl border-4 border-white/20">
                    <Image
                      src="/next.svg"
                      alt="Tuning Portal Dashboard Preview"
                      fill
                      style={{ objectFit: "cover" }}
                      priority
                      className="rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            ref={statsRef}
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8 text-center"
          >
            <motion.div
              variants={itemVariants}
              className="p-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 shadow-lg"
            >
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {count.users.toLocaleString()}+
              </div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">
                Happy Customers
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-8 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900 dark:to-purple-900 shadow-lg"
            >
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                {count.files.toLocaleString()}+
              </div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">
                ECU Files Tuned
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-8 rounded-xl bg-gradient-to-br from-purple-50 to-blue-100 dark:from-purple-900 dark:to-blue-900 shadow-lg"
            >
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {count.satisfaction}%
              </div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">
                Customer Satisfaction
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            ref={featuresRef}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h3
              variants={itemVariants}
              className="text-3xl font-bold text-gray-800 dark:text-white mb-4"
            >
              Powerful Tuning Features
            </motion.h3>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Our platform offers comprehensive tools to optimize your vehicle's
              performance
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-700 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="h-3 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <div className="p-8">
                <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                  Advanced Security
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Enterprise-grade authentication with secure password handling,
                  encryption, and robust session management.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-700 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <div className="p-8">
                <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                  Performance Analytics
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Real-time performance monitoring with detailed graphs and
                  insights to track your vehicle's improvements.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-700 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="h-3 bg-gradient-to-r from-purple-500 to-pink-600"></div>
              <div className="p-8">
                <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                  Instant Tuning
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Quick and efficient tuning process with same-day delivery for
                  most popular vehicle models.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            ref={testimonialsRef}
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h3
              variants={itemVariants}
              className="text-3xl font-bold text-gray-800 dark:text-white mb-4"
            >
              What Our Customers Say
            </motion.h3>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Don't just take our word for it - hear from some of our satisfied
              customers
            </motion.p>
          </motion.div>

          <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
            <Slider {...sliderSettings}>
              {/* Testimonial 1 */}
              <div className="px-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                      <Image
                        src="/images/testimonial-1.jpg"
                        alt="Customer"
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Michael Johnson
                      </h4>
                      <p className="text-blue-600 dark:text-blue-400">
                        BMW M3 Owner
                      </p>
                    </div>
                    <div className="ml-auto flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-5 h-5 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic">
                    "The performance gains after tuning were immediately
                    noticeable. My M3 now has a much smoother power delivery and
                    the throttle response is significantly improved. Highly
                    recommended!"
                  </p>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="px-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                      <Image
                        src="/images/testimonial-2.jpg"
                        alt="Customer"
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Sarah Williams
                      </h4>
                      <p className="text-blue-600 dark:text-blue-400">
                        Audi S4 Owner
                      </p>
                    </div>
                    <div className="ml-auto flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-5 h-5 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic">
                    "Not only did I get more power, but my fuel economy actually
                    improved as well! The online process was simple and the
                    customer service team was extremely helpful throughout."
                  </p>
                </div>
              </div>
            </Slider>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            ref={ctaRef}
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h3
              variants={itemVariants}
              className="text-4xl font-bold mb-6"
            >
              Ready to Transform Your Driving Experience?
            </motion.h3>
            <motion.p
              variants={itemVariants}
              className="text-xl mb-8 text-blue-100"
            >
              Join thousands of satisfied customers who have unlocked their
              vehicle's true potential.
            </motion.p>
            <motion.div variants={itemVariants}>
              <Link
                href="/auth/register"
                className="px-8 py-4 rounded-lg bg-white text-blue-600 font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 inline-block"
              >
                Get Started Today
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">Tuning Portal</h2>
              </div>
              <p className="text-gray-400 mb-6">
                Professional ECU tuning solutions for optimal vehicle
                performance.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-300"
                  >
                    ECU Remapping
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-300"
                  >
                    Performance Tuning
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-300"
                  >
                    Diesel Tuning
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-300"
                  >
                    Economy Tuning
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-300"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-300"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-300"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-300"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-gray-400 mb-4">
                Stay updated with our latest offers and tuning innovations.
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 w-full rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition-colors duration-300"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>
              &copy; {new Date().getFullYear()} Tuning Portal. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
