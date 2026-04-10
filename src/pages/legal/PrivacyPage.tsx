import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 pb-16">
        <p className="text-xs text-gray-400">Last updated: April 2026</p>

        <Section title="1. Introduction">
          Your privacy is important to us. This Privacy Policy explains what information Invocraft
          collects, how it is used, and your rights regarding your data. By using Invocraft, you
          agree to the practices described in this policy.
        </Section>

        <Section title="2. Information We Collect">
          <p className="mb-2">We collect the following information:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Mobile Number:</strong> Used for OTP authentication only.</li>
            <li><strong>Shop Information:</strong> Name, owner name, address, GST number (provided by you).</li>
            <li><strong>Business Data:</strong> Customers, suppliers, products, invoices, payments, and expenses you create.</li>
            <li><strong>Device Information:</strong> Browser type and device information for app compatibility.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul className="list-disc list-inside space-y-1">
            <li>To provide and operate the Invocraft service.</li>
            <li>To authenticate your identity via OTP.</li>
            <li>To save your business records so you can access them anytime.</li>
            <li>To improve the application based on usage patterns (anonymised).</li>
          </ul>
        </Section>

        <Section title="4. Data Storage">
          Your data is stored securely on our servers. We take reasonable technical and
          organisational measures to protect your data from unauthorised access, loss, or
          misuse. Your mobile number and business data are stored in an encrypted database.
        </Section>

        <Section title="5. Data Sharing">
          We do <strong>not</strong> sell, rent, or share your personal or business data with
          third parties for marketing or commercial purposes. We may share data only:
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>If required by law or a court order.</li>
            <li>To protect the rights or safety of Invocraft or its users.</li>
          </ul>
        </Section>

        <Section title="6. OTP & Authentication">
          Invocraft uses mobile OTP (One-Time Password) for authentication. The OTP is generated
          from your mobile number and is valid for 5 minutes. We do not store OTPs after they
          have been used or expired.
        </Section>

        <Section title="7. Cookies and Local Storage">
          Invocraft uses your browser's local storage to keep you logged in. No third-party
          tracking cookies are used. You can clear your local storage to log out.
        </Section>

        <Section title="8. Your Rights">
          You have the right to:
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Access the data associated with your account.</li>
            <li>Correct inaccurate business data through the app.</li>
            <li>Delete your account and all associated data by contacting us.</li>
          </ul>
        </Section>

        <Section title="9. Data Retention">
          We retain your data for as long as your account is active. If you stop using
          Invocraft, your data will be kept for a reasonable period to allow you to return.
          You may request deletion of your account and data at any time.
        </Section>

        <Section title="10. Children's Privacy">
          Invocraft is designed for business use and is not intended for anyone under the age
          of 18. We do not knowingly collect data from minors.
        </Section>

        <Section title="11. Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify you of
          significant changes through the app. Your continued use of Invocraft after changes
          are posted means you accept the updated policy.
        </Section>

        <Section title="12. Contact Us">
          If you have questions or concerns about this Privacy Policy, please contact us
          through the Invocraft app or reach out to the business owner who set up your
          account.
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
