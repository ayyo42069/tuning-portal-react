"use client";

import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
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
      <Header variant="landing" />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">About Tuning Portal</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p>
            Tuning Portal is a professional ECU tuning platform that provides high-quality
            tuning services for a wide range of vehicles. Our team of experienced tuners
            works with the latest technology to deliver optimal performance and reliability.
          </p>
          
          <h2>Our Mission</h2>
          <p>
            Our mission is to provide car enthusiasts with the best possible tuning
            experience, combining cutting-edge technology with expert knowledge to
            unlock your vehicle's full potential.
          </p>
          
          <h2>Our Team</h2>
          <p>
            Our team consists of certified professionals with years of experience in
            automotive tuning. We stay up-to-date with the latest developments in
            engine management systems and tuning techniques.
          </p>
          
          <h2>Quality Assurance</h2>
          <p>
            Every tune we deliver goes through a rigorous quality assurance process
            to ensure optimal performance, reliability, and safety. We use advanced
            diagnostic tools and testing procedures to verify our work.
          </p>
          
          <h2>Customer Support</h2>
          <p>
            We pride ourselves on providing excellent customer support. Our team is
            available to answer your questions and provide assistance throughout
            the tuning process.
          </p>
        </div>
      </main>
    </div>
  );
}