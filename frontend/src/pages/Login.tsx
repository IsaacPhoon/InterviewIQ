import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
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

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-400 via-blue-500 to-purple-600 opacity-70 animate-pulse"></div>
      </div>

      {/* Floating background elements */}
      <motion.div
        animate={floatingAnimation}
        className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          ...floatingAnimation,
          transition: { ...floatingAnimation.transition, delay: 1 },
        }}
        className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          ...floatingAnimation,
          transition: { ...floatingAnimation.transition, delay: 2 },
        }}
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-300/10 rounded-full blur-3xl"
      />

      {/* Login card with glassmorphism */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full space-y-8 relative z-10"
      >
        <motion.div
          className="card bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-12 rounded-3xl"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-center text-5xl font-bold text-white mb-3 drop-shadow-lg">
              AI Interview Prep Coach
            </h2>
            <p className="text-center text-base text-white/80 mb-10">
              Sign in to your account
            </p>
          </motion.div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="alert alert-error bg-red-500/20 backdrop-blur-sm border border-red-300/50 text-white shadow-lg"
              >
                {error}
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="space-y-6">
              <div className="form-control">
                <label htmlFor="email" className="label">
                  <span className="label-text text-white/90 font-medium text-lg">
                    Email address
                  </span>
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input input-bordered w-full bg-white/20 backdrop-blur-md border-white/30 text-white placeholder-white/50 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 text-lg h-14"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-control">
                <label htmlFor="password" className="label">
                  <span className="label-text text-white/90 font-medium text-lg">
                    Password
                  </span>
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input input-bordered w-full bg-white/20 backdrop-blur-md border-white/30 text-white placeholder-white/50 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 text-lg h-14"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full bg-white/30 hover:bg-white/40 backdrop-blur-md border-white/40 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg h-14"
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
                to="/register"
                className="text-white/90 hover:text-white font-medium underline underline-offset-4 decoration-white/50 hover:decoration-white transition-all text-base"
              >
                Don't have an account? Register
              </Link>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};
