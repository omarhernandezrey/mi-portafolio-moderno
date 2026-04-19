import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-24 px-6 max-w-4xl mx-auto text-[var(--text-color)]">
      <h1 className="text-4xl font-bold mb-8 text-[var(--primary-color)]">Privacy Policy</h1>
      
      <section className="space-y-6 text-sm leading-relaxed">
        <p><strong>Last update:</strong> April 15, 2026</p>
        
        <p>In accordance with <strong>Law 1581 of 2012</strong> (Habeas Data Law) of the Republic of Colombia and GDPR principles, I, <strong>Omar Hernández Rey</strong>, inform website users about the processing of their personal data.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Data Controller</h2>
        <p>The person responsible for the processing of your personal data is Omar Hernández Rey, residing in Bogotá, Colombia. You can contact me for any request related to your data via email: <strong>hernandezreyomar@gmail.com</strong>.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Data Collected</h2>
        <p>Through our AI chatbot and contact forms, we may collect:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Full name.</li>
          <li>Email address.</li>
          <li>Phone number (WhatsApp).</li>
          <li>Company name.</li>
          <li>Conversation content and requested project details.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Purpose of Processing</h2>
        <p>Your data will be used exclusively to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Respond to your inquiries and service requests.</li>
          <li>Generate customized commercial proposals.</li>
          <li>Manage technical or job interview scheduling.</li>
          <li>Maintain direct communication during project execution.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Third-Party Transfers</h2>
        <p>To provide the service, your data is processed by:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Supabase</strong> (Secure database storage).</li>
          <li><strong>Groq / Meta Llama</strong> (Natural language processing for chat via open-source models).</li>
        </ul>
        <p>We do not sell or share your data for third-party advertising purposes.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Subject Rights</h2>
        <p>As a data subject, you have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Know, update, and rectify your personal data.</li>
          <li>Request deletion of your data (Right to be forgotten).</li>
          <li>Revoke consent granted for processing.</li>
        </ul>

        <p className="mt-12 text-[var(--muted-color)] italic text-xs">By using the chatbot or contact form, you freely and voluntarily accept the processing of your data under these terms.</p>
      </section>
    </main>
  );
}
