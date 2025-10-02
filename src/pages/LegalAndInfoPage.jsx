import React from 'react';

const LegalAndInfoPage = () => {
  const currentEffectiveDate = "Oct 3, 2025";
  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Sprig WorkSuite Information Center</h1>
        <p className="text-lg text-muted-foreground">Mission, policies, and product details.</p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold">Mission</h2>
        <p>Sprig WorkSuite by WTRS Labs unifies projects, tasks, time and training so teams can execute work and upskill in one place.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Vision</h2>
        <p>A work OS where execution and enablement live together: SOP‑linked tasks, role paths, and evidence of competency.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Privacy Policy</h2>
        <p><strong>Effective Date:</strong> {currentEffectiveDate}</p>
        <p>We respect your privacy. Contact <a href="mailto:support@wtrsdb.com">support@wtrsdb.com</a> for requests.</p>
      </section>
    </div>
  );
};

export default LegalAndInfoPage;
