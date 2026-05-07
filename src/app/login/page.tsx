'use client';
import LoginForm from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="auth-page">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex items-center justify-center">
        <LoginForm />
      </motion.div>
    </div>
  );
}
