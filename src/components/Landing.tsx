'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Receipt, CreditCard, PiggyBank } from 'lucide-react'
import { GradientTitle } from './ui/GradientTitle'
import { GradientButton } from './ui/GradientButton'
import { FeatureCard } from './ui/FeatureCard'
import Link from 'next/link'

export default function Landing() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 pt-24 pb-32 relative"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10" />
          <div className="absolute -bottom-1/2 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-10" />
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center relative z-10"
        >
          <GradientTitle className="mb-6">
            Smart Budgeting with{' '}
            <span className="inline-block">BuyBudget</span>
          </GradientTitle>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Take control of your finances with intelligent budget tracking, receipt management,
            and automated payment monitoring.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login">
              <GradientButton variant="outline">
                Login
              </GradientButton>
            </Link>
            <Link href="/signup">
              <GradientButton>
                Join Now
              </GradientButton>
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <FeatureCard
            title="Receipt Upload"
            description="Instantly capture and categorize receipts. Keep track of every purchase with our smart scanning technology."
            icon={Receipt}
            delay={0.2}
          />
          <FeatureCard
            title="Recurring Payments"
            description="Never forget to budget for subscriptions. Set up and track recurring payments to prevent overspending."
            icon={CreditCard}
            iconColor="text-purple-400"
            delay={0.3}
          />
          <FeatureCard
            title="Budget Planning"
            description="Whether you're a student or professional, create personalized budgets that help you enjoy life while building financial security."
            icon={PiggyBank}
            delay={0.4}
          />
        </div>
      </motion.section>

      {/* Stats Section */}
      {/* <section className="bg-slate-900/50 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/50" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <GradientTitle className="text-3xl md:text-4xl mb-4">
              Take Control of Your Spending
            </GradientTitle>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Join thousands of users who have improved their financial health with BuyBudget
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-blue-400 mb-2">30%</div>
              <p className="text-slate-400">Average Savings</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-purple-400 mb-2">50K+</div>
              <p className="text-slate-400">Active Users</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-blue-400 mb-2">1M+</div>
              <p className="text-slate-400">Receipts Processed</p>
            </motion.div>
          </div>
        </div>
      </section> */}
    </main>
  )
}
