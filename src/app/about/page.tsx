"use client";

import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { Header } from "@/components/landing/Header";
import Link from "next/link";
import Image from "next/image";

export default function About() {
  const [headerRef, headerInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [contentRef, contentInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <div ref={headerRef}>
        <Header />
      </div>

      <section className="bg-gradient-to-b from-blue-900 to-blue-800 text-white py-16 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute w-96 h-96 rounded-full bg-blue-500 opacity-20 -top-20 -left-20 animate-blob will-change-transform"></div>
          <div className="absolute w-96 h-96 rounded-full bg-indigo-500 opacity-20 top-1/3 -right-20 animate-blob animation-delay-2000 will-change-transform"></div>
          <div className="absolute w-96 h-96 rounded-full bg-purple-500 opacity-20 bottom-0 left-1/3 animate-blob animation-delay-4000 will-change-transform"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center"
          >
            <motion.h1 
              variants={itemVariants} 
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              About Us
            </motion.h1>
            <motion.p 
              variants={itemVariants} 
              className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90"
            >
              The story of two friends who combined their passion for cars and web development
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div 
          ref={contentRef} 
          className="container mx-auto px-4"
        >
          <motion.div
            initial="hidden"
            animate={contentInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="inline-block p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mb-2">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Makkai</h2>
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">The Tuning Expert</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Makkai's journey began with a simple passion for cars that evolved into expertise. Self-taught and driven by curiosity, he mastered the art of automotive tuning through years of hands-on experience and countless hours of research.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                What sets Makkai apart is his meticulous attention to detail and deep understanding of vehicle electronics. He approaches each tuning project with precision, ensuring optimal performance while maintaining reliability.
              </p>
              <div className="pt-4">
                <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full mr-2 mb-2">ECU Remapping</span>
                <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full mr-2 mb-2">Performance Tuning</span>
                <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full mr-2 mb-2">Diagnostics</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <div className="inline-block p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mb-2">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Kristof</h2>
              <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400">The Web Developer</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Kristof brings technical expertise and creative vision to the digital side of the Tuning Portal. With a background in web development and a passion for creating seamless user experiences, he built the platform that connects Makkai's tuning services with clients worldwide.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                His focus on modern, responsive design ensures that the Tuning Portal is accessible and easy to use on any device. Kristof continuously improves the platform, implementing new features and optimizing performance.
              </p>
              <div className="pt-4">
                <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 text-sm font-medium px-3 py-1 rounded-full mr-2 mb-2">React</span>
                <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 text-sm font-medium px-3 py-1 rounded-full mr-2 mb-2">Next.js</span>
                <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 text-sm font-medium px-3 py-1 rounded-full mr-2 mb-2">UI/UX Design</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial="hidden"
            animate={contentInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="mt-20"
          >
            <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Our Story</h2>
              <div className="space-y-6 text-gray-700 dark:text-gray-300">
                <p>
                  The Tuning Portal was born from a friendship and a shared vision. Makkai and Kristof met through a mutual interest in cars, with Makkai already establishing himself as a skilled tuner in the local community.
                </p>
                <p>
                  Recognizing the potential to reach more car enthusiasts and provide professional tuning services to a wider audience, they decided to combine their complementary skills. Kristof proposed creating an online platform that would showcase Makkai's expertise and make his services accessible to clients beyond their local area.
                </p>
                <p>
                  What started as a simple website has evolved into a comprehensive tuning portal, offering custom tuning solutions, technical support, and a community for car enthusiasts. The partnership between Makkai's technical knowledge of vehicles and Kristof's web development skills has created a unique service that bridges the gap between automotive performance and digital accessibility.
                </p>
                <p>
                  Today, the Tuning Portal serves clients across Europe, with Makkai handling the tuning operations and Kristof continuously improving the online experience. Their friendship remains the foundation of the business, driving them to deliver exceptional service and innovative solutions.
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial="hidden"
            animate={contentInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="mt-16 text-center"
          >
            <motion.div variants={itemVariants}>
              <Link 
                href="/"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                <span>Back to Home</span>
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}