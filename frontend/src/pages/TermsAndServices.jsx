import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/shared/ui/Header';
import { FileText } from 'lucide-react';
import { useAuth } from '@/stores/useAuthStore';

export function TermsAndServices() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-bg text-text page-enter">
      <Helmet>
        <title>Terms and Services | DataDesk</title>
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
            <FileText size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Terms and Services</h1>
            <p className="text-text-secondary">Last updated: August 2, 2026</p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary">
          <h2>1. Agreement to Terms</h2>
          <p>
            These Terms of Service constitute a legally binding agreement made between you, whether
            personally or on behalf of an entity ("you") and DataDesk ("Company", "we", "us", or "our"),
            concerning your access to and use of the DataDesk platform. You agree that by accessing the
            Site, you have read, understood, and agreed to be bound by all of these Terms of Service.
          </p>

          <h2>2. Intellectual Property Rights</h2>
          <p>
            Unless otherwise indicated, the Site is our proprietary property and all source code, databases,
            functionality, software, website designs, audio, video, text, photographs, and graphics on the
            Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein
            (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright
            and trademark laws and various other intellectual property rights and unfair competition laws.
          </p>

          <h2>3. User Representations</h2>
          <p>
            By using the Site, you represent and warrant that: 
          </p>
          <ul>
            <li>All registration information you submit will be true, accurate, current, and complete.</li>
            <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
            <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
            <li>You will not access the Site through automated or non-human means, whether through a bot, script, or otherwise.</li>
            <li>You will not use the Site for any illegal or unauthorized purpose.</li>
          </ul>

          <h2>4. Prohibited Activities</h2>
          <p>
            You may not access or use the Site for any purpose other than that for which we make the Site
            available. The Site may not be used in connection with any commercial endeavors except those
            that are specifically endorsed or approved by us.
          </p>
          <p>As a user of the Site, you agree not to:</p>
          <ul>
            <li>Systematically retrieve data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
            <li>Make any unauthorized use of the Site, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email.</li>
            <li>Circumvent, disable, or otherwise interfere with security-related features of the Site.</li>
            <li>Engage in unauthorized framing of or linking to the Site.</li>
          </ul>

          <h2>5. Contact Us</h2>
          <p>
            In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: 
            <br />
            <strong>hetmonpara17@gmail.com</strong>
          </p>
        </div>
      </main>
    </div>
  );
}
