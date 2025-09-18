import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, ShieldCheck, UserCog, Bug, Target, Eye, FileText } from 'lucide-react';

const LegalAndInfoPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  const SectionCard = ({ icon, title, children, id }) => (
    <motion.div variants={itemVariants} id={id}>
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-[var(--theme-accent-primary)]">
            {React.cloneElement(icon, { className: "h-6 w-6"})}
            <span className="ml-3 text-foreground">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm sm:prose-base prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-[var(--theme-accent-primary)] hover:prose-a:text-[var(--theme-accent-primary-hover)] prose-ul:text-muted-foreground prose-li:marker:text-[var(--theme-accent-primary)]">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
  
  const currentEffectiveDate = "May 26, 2025";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 p-4 md:p-6"
    >
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
          Work Suite Pro Information Center
        </h1>
        <p className="text-lg text-muted-foreground">
          Important details about our mission, policies, and application usage.
        </p>
      </motion.div>

      <SectionCard icon={<Target />} title="Mission Statement" id="mission">
        <p>
          Our mission at Work Suite Pro is to empower businesses and individuals by providing an intuitive, powerful, and integrated data management and project oversight platform. We strive to simplify complex data interactions, foster collaboration, and drive insightful decision-making through innovative technology and user-centric design. Our tagline: "Optimize, Track, Succeed—Smarter Workflows for Seamless Productivity."
        </p>
      </SectionCard>

      <SectionCard icon={<Eye />} title="Vision Statement" id="vision">
        <p>
          Our vision for Work Suite Pro is to be the leading console for seamless data orchestration and project excellence, creating a future where data-driven insights are accessible to everyone, enabling unparalleled efficiency, growth, and success for our users across diverse industries.
        </p>
      </SectionCard>

      <SectionCard icon={<FileText />} title="Privacy Policy" id="privacy-policy">
        <p><strong>Effective Date:</strong> {currentEffectiveDate}</p>
        
        <h3>Overview</h3>
        <p>At Work Suite Pro, the protection of your personal and business data is our primary concern. We operate under a strict commitment to data security and privacy, ensuring that all information you entrust to our platform is safeguarded using industry-leading measures.</p>

        <h3>Data Collection & Usage</h3>
        <h4>Personal Information:</h4>
        <p>We collect data such as your name, email address, and usage patterns solely for the purpose of providing and improving our services.</p>
        <h4>Usage Data:</h4>
        <p>Our system automatically collects information (including IP addresses, browser types, and activity logs) to monitor and enhance the platform's performance.</p>
        <h4>Cookies & Tracking:</h4>
        <p>We use cookies and similar tracking technologies only to facilitate user experience, maintain active sessions, and perform analytical functions.</p>

        <h3>Security Measures</h3>
        <h4>Encryption:</h4>
        <p>All data in transit is secured using TLS (Transport Layer Security) encryption, and data at rest is protected with AES-256 encryption.</p>
        <h4>Authentication & Access Controls:</h4>
        <p>We use modern authentication protocols (via Supabase and AWS) including multi-factor authentication and role-based access control to ensure that only authorized individuals can access sensitive data.</p>
        <h4>Regular Audits:</h4>
        <p>Our systems undergo frequent security audits, vulnerability assessments, and performance monitoring to ensure that our security measures remain up-to-date and robust.</p>
        <h4>Data Isolation:</h4>
        <p>We enforce strict isolation measures and utilize modern cloud-based security practices to prevent unauthorized access, protect against external threats, and maintain data integrity at all times.</p>

        <h3>Third-Party Sharing</h3>
        <p>We do not sell or share your personal data with third parties without your explicit consent, except when required by law or approved service integrations designed to enhance the platform’s functionality.</p>

        <h3>User Rights</h3>
        <p>Users have the right to access, modify, or request deletion of their data. Please contact us at info@worksuitepro.com for any inquiries regarding your personal data.</p>

        <h3>Policy Updates</h3>
        <p>As our platform evolves, so might our privacy practices. We will update this policy periodically and advise you of any significant changes. Please review this section regularly for updates.</p>

        <h3>Contact Information</h3>
        <p>For questions or concerns about this Privacy Policy, please contact us at:</p>
        <p>Email: info@worksuitepro.com</p>
        <p>Address: Parsberg, Bavaria, Germany</p>
      </SectionCard>

      <SectionCard icon={<UserCog />} title="User Manual" id="user-manual">
        <h3>Getting Started</h3>
        <p>
          Welcome to Work Suite Pro! To begin, log in with your credentials. If you don't have an account, please sign up.
        </p>
        <h3>Dashboard</h3>
        <p>
          The Dashboard provides an overview of key metrics, project statuses, and upcoming events. It's your central hub for quick insights.
        </p>
        <h3>Data Central</h3>
        <p>
          In Data Central, you can:
        </p>
        <ul>
          <li>View your database schema.</li>
          <li>Select tables to query.</li>
          <li>Apply filters to refine data.</li>
          <li>Execute custom SQL queries.</li>
          <li>View and sort query results.</li>
        </ul>
        <h3>Project Management</h3>
        <p>
          Manage your projects, track tasks, assess risks, and collaborate with stakeholders. Each tab provides tools for different aspects of project management.
        </p>
        <h3>Finance Hub</h3>
        <p>
          Analyze financial data, track expenses, and visualize revenue streams. (Further development ongoing)
        </p>
        <h3>File Sharing</h3>
        <p>
          Upload and manage files related to your projects. (Further development ongoing)
        </p>
        <h3>Settings</h3>
        <p>
          Configure your profile and application preferences.
        </p>
        <h3>Admin Console</h3>
        <p>
          (For administrators) Access development tools, including database seeding utilities.
        </p>
      </SectionCard>

      <SectionCard icon={<Bug />} title="Known Bugs & Limitations" id="known-bugs">
        <h3>General</h3>
        <ul>
          <li>UI responsiveness on very small screens might have minor inconsistencies.</li>
          <li>Large dataset operations in Data Central (client-side filtering/sorting) might experience slowdowns if query results exceed several hundred rows. Default queries are limited to prevent this.</li>
        </ul>
        <h3>Data Central</h3>
        <ul>
          <li>Advanced SQL query validation is basic. Complex queries might not always provide user-friendly error messages directly from the UI before execution.</li>
          <li>Date filtering precision is based on full days. Time-specific filtering within a day is not yet implemented in the UI controls.</li>
        </ul>
        <h3>File Sharing & Finance Hub</h3>
        <ul>
          <li>These sections are currently placeholders with basic UI and limited functionality. Full implementation is pending.</li>
        </ul>
        <h3>Project Management</h3>
        <ul>
          <li>Data persistence for project tabs (Risks, Stakeholders, etc.) is not yet fully implemented. Data entered may not save across sessions.</li>
        </ul>
        <p>We are continuously working to improve Work Suite Pro and address these issues. Please report any new bugs you encounter through the designated feedback channel.</p>
      </SectionCard>

    </motion.div>
  );
};

export default LegalAndInfoPage;