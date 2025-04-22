"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamically import icons
const BoltIcon = dynamic(
  () => import("@heroicons/react/24/outline").then((mod) => mod.BoltIcon),
  { ssr: false }
);
const ChartBarIcon = dynamic(
  () => import("@heroicons/react/24/outline").then((mod) => mod.ChartBarIcon),
  { ssr: false }
);
const Cog6ToothIcon = dynamic(
  () => import("@heroicons/react/24/outline").then((mod) => mod.Cog6ToothIcon),
  { ssr: false }
);
const ShieldCheckIcon = dynamic(
  () => import("@heroicons/react/24/outline").then((mod) => mod.ShieldCheckIcon),
  { ssr: false }
);

interface FeaturesProps {
  inView: boolean;
}

export const Features = ({ inView }: FeaturesProps) => {
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

  const features = [
    {
      icon: <BoltIcon className="w-6 h-6 text-blue-400" />,
      title: "Performance Tuning",
      description:
        "Unlock your vehicle's full potential with custom performance tuning.",
    },
    {
      icon: <ChartBarIcon className="w-6 h-6 text-purple-400" />,
      title: "Fuel Efficiency",
      description:
        "Optimize your engine for better fuel economy without sacrificing power.",
    },
    {
      icon: <Cog6ToothIcon className="w-6 h-6 text-blue-400" />,
      title: "Custom Maps",
      description:
        "Tailored tuning maps for your specific vehicle and driving style.",
    },
    {
      icon: <ShieldCheckIcon className="w-6 h-6 text-purple-400" />,
      title: "Safe & Reliable",
      description:
        "Professional tuning with safety as our top priority.",
    },
  ];

  const testimonials = [
    {
      quote: "The performance increase after tuning was incredible. My car feels like a completely different machine!",
      author: "Michael T.",
      role: "BMW M3 Owner",
      rating: 5
    },
    {
      quote: "Professional service from start to finish. The team was responsive and delivered exactly what I needed.",
      author: "Sarah L.",
      role: "Audi RS6 Owner",
      rating: 5
    },
    {
      quote: "I was skeptical at first, but the results speak for themselves. Fuel efficiency improved by 15%!",
      author: "David R.",
      role: "VW Golf R Owner",
      rating: 5
    }
  ];

  return (
    <section className="relative overflow-hidden py-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-purple-900"></div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ x: -100, y: -100 }}
          animate={{ x: 0, y: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute w-[600px] h-[600px] rounded-full bg-blue-500/20 blur-3xl"
        />
        <motion.div
          initial={{ x: 100, y: 100 }}
          animate={{ x: 0, y: 0 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
          className="absolute w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-3xl"
        />
      </div>

      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={containerVariants}
        className="container mx-auto px-4 relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why Choose Us
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience the perfect blend of performance, efficiency, and
            reliability
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Process section */}
        <motion.div variants={itemVariants} className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Tuning Process
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Simple, efficient, and professional - from start to finish
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { number: "01", title: "Upload", description: "Submit your ECU file through our secure portal" },
              { number: "02", title: "Analyze", description: "Our experts analyze your vehicle's data" },
              { number: "03", title: "Tune", description: "Custom tuning based on your requirements" },
              { number: "04", title: "Deliver", description: "Receive your optimized ECU file" }
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {step.number}
                </div>
                <div className="pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials section */}
        <motion.div variants={itemVariants}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Customers Say
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto mb-6"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold mr-3">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
