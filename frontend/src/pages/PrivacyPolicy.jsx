import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/shared/ui/Header';
import { Shield } from 'lucide-react';
import { useAuth } from '@/stores/useAuthStore';

export function PrivacyPolicy() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-bg text-text page-enter">
      <Helmet>
        <title>Privacy Policy | DataDesk</title>
      </Helmet>
      
      <Header
        onShowAuth={() => navigate('/login')}
        onShowSettings={() => {}}
        navLinks={[
          { label: 'Home', onClick: () => navigate('/') },
          { label: 'Practice', onClick: () => navigate('/practice/airlines'), primary: true },
        ]}
      />

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
            <p className="text-text-secondary">Last updated: August 2, 2026</p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary">
          <h2>1. Introduction</h2>
          <p>
            At DataDesk, we take your privacy seriously. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you visit our platform. Please read this
            privacy policy carefully. If you do not agree with the terms of this privacy policy, please
            do not access the site.
          </p>

          <h2>2. Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect
            on the Site includes:
          </p>
          <ul>
            <li>
              <strong>Personal Data:</strong> Personally identifiable information, such as your name,
              email address, and avatar that you voluntarily give to us when you register with the
              Site or when you choose to participate in various activities related to the Site.
            </li>
            <li>
              <strong>Derivative Data:</strong> Information our servers automatically collect when you
              access the Site, such as your IP address, your browser type, your operating system, your
              access times, and the pages you have viewed directly before and after accessing the Site.
            </li>
            <li>
              <strong>Usage Data:</strong> We track your progress, query execution times, and gamification metrics locally in your browser and sync them to our servers to provide you with a continuous learning experience across devices.
            </li>
          </ul>

          <h2>3. Use of Your Information</h2>
          <p>
            Having accurate information about you permits us to provide you with a smooth, efficient, and
            customized experience. Specifically, we may use information collected about you via the Site to:
          </p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Monitor your progress and calculate gamification metrics (XP, Streaks).</li>
            <li>Improve our AI tutor's suggestions based on your query history.</li>
            <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
          </ul>

          <h2>4. Data Storage and Local Execution</h2>
          <p>
            DataDesk is unique because the core SQL engine runs entirely locally in your browser using WASM. 
            This means the datasets you query are downloaded to your device, and the queries you write 
            execute locally without sending the raw data to our servers. Only the metadata (success/fail, execution time) 
            is sent back to our servers to track your progress.
          </p>

          <h2>5. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at: 
            <br />
            <strong>privacy@datadesk.example.com</strong>
          </p>
        </div>
      </main>
    </div>
  );
}
