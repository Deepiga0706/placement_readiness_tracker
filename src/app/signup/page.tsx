'use client';
import SignupForm from '@/components/auth/SignupForm';
import { motion } from 'framer-motion';

export default function SignupPage() {
  return (
    <div className="auth-page">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex items-center justify-center">
        <SignupForm />
      </motion.div>
    </div>
  );
}
