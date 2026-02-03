import React from 'react';

type Props = {
  onBack?: () => void;
};

const TermsAndConditionsPage: React.FC<Props> = ({ onBack }) => {
  const effectiveDate = 'February 3, 2026';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Terms & Conditions</h1>
            <p className="text-sm text-slate-400 mt-2">Effective date: {effectiveDate}</p>
          </div>
          <button
            onClick={() => (onBack ? onBack() : window.history.back())}
            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition-all"
          >
            Back
          </button>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">1. Acceptance</h2>
            <p className="text-slate-300 leading-relaxed">
              By accessing or using BlurMagic AI (the “Service”), you agree to these Terms & Conditions. If you do not
              agree, do not use the Service.
            </p>
          </section>

          <section className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">2. Eligibility</h2>
            <ul className="list-disc pl-5 text-slate-300 space-y-2">
              <li>You must be at least 18 years old (or the legal age in your jurisdiction) to use the Service.</li>
              <li>You are responsible for ensuring your use complies with local laws and regulations.</li>
            </ul>
          </section>

          <section className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">3. Your Content & Rights</h2>
            <ul className="list-disc pl-5 text-slate-300 space-y-2">
              <li>
                You represent and warrant you own the content you upload or have all necessary rights and permissions to
                upload and process it.
              </li>
              <li>You are solely responsible for the content you upload and how you use the output.</li>
            </ul>
          </section>

          <section className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">4. Prohibited Use</h2>
            <p className="text-slate-300 leading-relaxed mb-3">You agree not to use the Service to process:</p>
            <ul className="list-disc pl-5 text-slate-300 space-y-2">
              <li>Child sexual abuse material (CSAM) or any exploitative content involving minors.</li>
              <li>Non-consensual intimate imagery, harassment, stalking, doxxing, or other abusive behavior.</li>
              <li>Content that infringes intellectual property or privacy rights of others.</li>
              <li>Illegal content or content intended to facilitate illegal activity.</li>
            </ul>
          </section>

          <section className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">5. Safety & Moderation</h2>
            <p className="text-slate-300 leading-relaxed">
              The Service may apply automated checks to prevent prohibited uses. We may suspend or terminate access if we
              reasonably believe there is a violation of these Terms or applicable law.
            </p>
          </section>

          <section className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">6. Privacy</h2>
            <p className="text-slate-300 leading-relaxed">
              Your use may involve processing images and related metadata. Where available, you can opt to remove
              metadata before downloading. For more details, refer to the in-app privacy information.
            </p>
          </section>

          <section className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">7. Plans, Credits, and Manual Billing</h2>
            <ul className="list-disc pl-5 text-slate-300 space-y-2">
              <li>Some features may require a paid plan or credits.</li>
              <li>
                Payments and upgrades may be handled manually. Plan changes and credit grants may be applied after
                verification of payment.
              </li>
              <li>Credits may not be refundable except where required by law.</li>
            </ul>
          </section>

          <section className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">8. Disclaimer</h2>
            <p className="text-slate-300 leading-relaxed">
              The Service is provided “as is” and “as available”. We do not warrant that the Service will be uninterrupted
              or error-free, or that outputs will meet your requirements.
            </p>
          </section>

          <section className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">9. Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed">
              To the maximum extent permitted by law, BlurMagic AI will not be liable for any indirect, incidental,
              special, consequential, or punitive damages, or any loss of profits, data, or goodwill.
            </p>
          </section>

          <section className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">10. Termination</h2>
            <p className="text-slate-300 leading-relaxed">
              We may suspend or terminate your access at any time for violations of these Terms or to protect the Service
              and other users.
            </p>
          </section>

          <section className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">11. Changes</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update these Terms from time to time. Continued use of the Service after changes means you accept
              the updated Terms.
            </p>
          </section>

          <section className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">12. Contact</h2>
            <p className="text-slate-300 leading-relaxed">
              For questions about these Terms, contact us through the support channel listed on the website/app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;

