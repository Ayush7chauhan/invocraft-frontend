import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Terms of Service</h1>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 pb-16">
        <p className="text-xs text-gray-400">Last updated: April 2026</p>

        <Section title="1. Acceptance of Terms">
          By accessing and using Invocraft, you accept and agree to be bound by these Terms of
          Service. If you do not agree to these terms, please do not use the application.
        </Section>

        <Section title="2. Description of Service">
          Invocraft is a retail billing and Khata (ledger) management application designed for
          small and medium businesses in India. The app provides tools for managing invoices,
          customers, suppliers, inventory, payments, and expenses.
        </Section>

        <Section title="3. User Account">
          <ul className="list-disc list-inside space-y-1">
            <li>You must provide a valid Indian mobile number to create an account.</li>
            <li>Your mobile number is used for OTP-based authentication — no password required.</li>
            <li>You are responsible for all activity under your account.</li>
            <li>Do not share your OTP with anyone.</li>
          </ul>
        </Section>

        <Section title="4. Data Ownership">
          All business data you enter into Invocraft (customers, invoices, products, etc.) belongs
          to you. We do not sell, rent, or share your business data with third parties for
          commercial purposes.
        </Section>

        <Section title="5. Acceptable Use">
          You agree not to:
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Use the service for any unlawful purpose.</li>
            <li>Attempt to gain unauthorised access to other users' data.</li>
            <li>Reverse engineer, decompile, or tamper with the application.</li>
            <li>Use the app in any way that disrupts the service for other users.</li>
          </ul>
        </Section>

        <Section title="6. Invoices and Financial Records">
          Invocraft helps you create and manage invoices. You are solely responsible for the
          accuracy of the financial records you maintain. Invocraft is not a licensed accounting
          software and does not provide tax or financial advice. Please consult a qualified
          accountant for compliance with GST and other tax regulations.
        </Section>

        <Section title="7. Service Availability">
          We strive to keep Invocraft available at all times, but we do not guarantee uninterrupted
          access. The service may be temporarily unavailable due to maintenance, updates, or
          circumstances beyond our control.
        </Section>

        <Section title="8. Limitation of Liability">
          Invocraft is provided "as is" without warranties of any kind. We are not liable for any
          indirect, incidental, or consequential damages arising from your use of the service,
          including data loss, financial loss, or business interruption.
        </Section>

        <Section title="9. Changes to Terms">
          We may update these Terms of Service from time to time. Continued use of the application
          after changes are posted constitutes acceptance of the revised terms. We will notify
          users of significant changes through the app.
        </Section>

        <Section title="10. Contact">
          If you have any questions about these Terms, please contact us through the app or reach
          out to the business owner who provided you with access to Invocraft.
        </Section>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} Invocraft. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
      <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-1">
        {children}
      </div>
    </div>
  );
}
