import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-md px-4 pb-16 pt-6">
      <header className="mb-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="rounded-full p-1.5 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Privacy Policy</h1>
      </header>

      <div className="space-y-4 text-sm leading-relaxed text-slate-600">
        <p className="text-xs text-slate-400">Last updated: July 2026</p>

        <Section title="1. Information We Collect">
          We collect information you provide directly, including your name, email address, phone
          number, and financial transaction data (income, expenses, budgets, and savings goals)
          that you enter into PulaTrack.
        </Section>

        <Section title="2. How We Use Your Information">
          Your data is used solely to provide the App's features to you: displaying your
          dashboard, calculating budgets, and tracking savings goals. We do not sell your
          personal or financial data to third parties.
        </Section>

        <Section title="3. Data Storage & Security">
          Your data is stored using Firebase (Google Cloud) infrastructure with industry-standard
          encryption in transit and at rest. We implement additional protections including
          optional 2-step verification and an app-lock PIN. This is placeholder text — you should
          confirm your actual data-processing practices comply with the Botswana Data Protection
          Act, 2018 before publishing this policy.
        </Section>

        <Section title="4. Your Rights">
          Under the Botswana Data Protection Act, you have the right to access, correct, or
          request deletion of your personal data. Contact us to exercise these rights.
        </Section>

        <Section title="5. Third-Party Services">
          PulaTrack uses Firebase Authentication and Firestore (Google) to operate. Google's
          privacy practices govern data processed through these services.
        </Section>

        <Section title="6. Data Retention">
          We retain your data for as long as your account is active. You may request account
          deletion at any time, which will remove your associated transaction, budget, and goal
          data.
        </Section>

        <Section title="7. Children's Privacy">
          PulaTrack is not intended for use by individuals under the age of 18.
        </Section>

        <Section title="8. Changes to This Policy">
          We may update this Privacy Policy periodically. We will notify users of material
          changes within the App.
        </Section>

        <Section title="9. Contact Us">
          For privacy-related questions, contact us at privacy@pulatrack.example (placeholder).
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="mb-1 font-semibold text-slate-800">{title}</h2>
      <p>{children}</p>
    </div>
  );
}
