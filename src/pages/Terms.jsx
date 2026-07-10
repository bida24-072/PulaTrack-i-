import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-md px-4 pb-16 pt-6">
      <header className="mb-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="rounded-full p-1.5 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Terms and Conditions</h1>
      </header>

      <div className="space-y-4 text-sm leading-relaxed text-slate-600">
        <p className="text-xs text-slate-400">Last updated: July 2026</p>

        <Section title="1. Acceptance of Terms">
          By creating an account or using PulaTrack ("the App"), you agree to be bound by these
          Terms and Conditions. If you do not agree, please do not use the App. This is placeholder
          legal text — replace with terms reviewed by a qualified attorney licensed in Botswana
          before launching publicly.
        </Section>

        <Section title="2. Description of Service">
          PulaTrack is a personal finance tracking tool that allows users in Botswana to record
          income, expenses, budgets, and savings goals in Botswana Pula (BWP). PulaTrack does not
          provide financial, investment, tax, or legal advice, and is not a licensed financial
          institution under the Bank of Botswana or the Non-Bank Financial Institutions Regulatory
          Authority (NBFIRA).
        </Section>

        <Section title="3. Account Registration">
          You must provide accurate information when creating an account and are responsible for
          maintaining the confidentiality of your login credentials, PIN, and any two-factor
          authentication codes.
        </Section>

        <Section title="4. User Responsibilities">
          You agree to use PulaTrack only for lawful purposes and not to misrepresent transaction
          data or attempt to interfere with the App's security features, including the app lock
          and 2-step verification.
        </Section>

        <Section title="5. Data Accuracy">
          PulaTrack relies on data you enter manually. We are not responsible for financial
          decisions made based on inaccurate or incomplete data you provide.
        </Section>

        <Section title="6. Limitation of Liability">
          To the maximum extent permitted under the laws of Botswana, PulaTrack and its
          developers shall not be liable for any indirect, incidental, or consequential damages
          arising from your use of the App.
        </Section>

        <Section title="7. Governing Law">
          These Terms are governed by the laws of the Republic of Botswana. Any disputes shall be
          subject to the exclusive jurisdiction of the courts of Botswana.
        </Section>

        <Section title="8. Changes to These Terms">
          We may update these Terms from time to time. Continued use of the App after changes
          constitutes acceptance of the revised Terms.
        </Section>

        <Section title="9. Contact">
          For questions about these Terms, contact us at support@pulatrack.example (placeholder).
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
