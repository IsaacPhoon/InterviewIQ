'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { AuthBackground } from "@/components/AuthBackground";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [displayedText, setDisplayedText] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const introText =
    "Your personal AI interviewer. Upload a job description, talk through real interview questions, and get instant AI-powered scoring—right in your browser.";

  useEffect(() => {
    let index = 0;
    const typingSpeed = 25;
    let timeoutId: NodeJS.Timeout;

    const typeText = () => {
      if (index < introText.length) {
        setDisplayedText(introText.slice(0, index + 1));
        index++;
        timeoutId = setTimeout(typeText, typingSpeed);
      } else {
        timeoutId = setTimeout(() => {
          setShowIntro(false);
        }, 1500);
      }
    };

    typeText();

    // Handle spacebar press to skip intro
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && showIntro) {
        e.preventDefault();
        clearTimeout(timeoutId);
        setShowIntro(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [showIntro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMessage =
        (err && typeof err === 'object' && 'response' in err &&
         err.response && typeof err.response === 'object' && 'data' in err.response &&
         err.response.data && typeof err.response.data === 'object' && 'detail' in err.response.data &&
         typeof err.response.data.detail === 'string')
          ? err.response.data.detail
          : "Login failed. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <AuthBackground />

      <AnimatePresence mode="wait">
        {showIntro ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl w-full relative z-10 text-center px-8"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-800 dark:text-gray-100 leading-relaxed tracking-tight">
              {displayedText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block ml-1"
              >
                |
              </motion.span>
            </h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex items-center justify-center gap-2"
            >
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-gray-500 dark:text-gray-400 text-sm font-medium"
              >
                Press
              </motion.span>
              <motion.kbd
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="px-3 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm"
              >
                SPACE
              </motion.kbd>
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-gray-500 dark:text-gray-400 text-sm font-medium"
              >
                to skip
              </motion.span>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl w-full space-y-8 relative z-10"
          >
            <motion.div
              layoutId="auth-card"
              className="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl p-12 rounded-2xl"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-center text-5xl font-light text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                  InterviewIQ
                </h2>
                <p className="text-center text-base text-gray-600 dark:text-gray-400 mb-10">
                  Sign in to your account
                </p>
              </motion.div>

              <form className="space-y-8" onSubmit={handleSubmit}>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="alert bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg p-4"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.div variants={itemVariants} className="space-y-6">
                  <div className="form-control">
                    <label htmlFor="email" className="label mb-2">
                      <span className="label-text text-gray-900 dark:text-gray-100 font-semibold text-base">
                        Email Address
                      </span>
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.005 }}
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="input input-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 text-base h-12 rounded-lg transition-all"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-control">
                    <label htmlFor="password" className="label mb-2">
                      <span className="label-text text-gray-900 dark:text-gray-100 font-semibold text-base">
                        Password
                      </span>
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.005 }}
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="input input-bordered w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 text-base h-12 rounded-lg transition-all"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white border-0 text-white dark:text-gray-900 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-base h-12 rounded-lg transition-all"
                  >
                    {loading ? (
                      <span className="loading loading-spinner loading-md"></span>
                    ) : (
                      "Sign in"
                    )}
                  </motion.button>
                </motion.div>

                <motion.div variants={itemVariants} className="text-center">
                  <Link
                    href="/register"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-normal text-sm transition-colors"
                  >
                    Don&apos;t have an account?{" "}
                    <span className="font-medium underline underline-offset-2">
                      Register
                    </span>
                  </Link>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
