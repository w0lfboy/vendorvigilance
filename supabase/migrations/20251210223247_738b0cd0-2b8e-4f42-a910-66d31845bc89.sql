-- Create the template seeds table
CREATE TABLE IF NOT EXISTS public.questionnaire_template_seeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seed_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  framework TEXT,
  questions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.questionnaire_template_seeds ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read seeds (they're public templates)
CREATE POLICY "Anyone can view template seeds" 
ON public.questionnaire_template_seeds 
FOR SELECT 
USING (true);

-- SOC 2 TYPE II QUESTIONNAIRE
INSERT INTO questionnaire_template_seeds (seed_key, name, description, framework, questions)
VALUES (
  'soc2_type2',
  'SOC 2 Type II Assessment',
  'Comprehensive vendor assessment based on AICPA Trust Services Criteria covering security, availability, processing integrity, confidentiality, and privacy.',
  'SOC 2',
  '[
    {"section": "Organization & Management (CC1)", "question_text": "Does your organization have a documented information security policy that is reviewed and approved by management at least annually?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": "The policy should define security objectives, roles, and responsibilities.", "compliance_mapping": {"SOC2": ["CC1.1", "CC1.2"]}, "risk_category": "Governance"},
    {"section": "Organization & Management (CC1)", "question_text": "Is there a designated individual or team responsible for information security (e.g., CISO, Security Team)?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": "This person/team should have clear authority and accountability for security.", "compliance_mapping": {"SOC2": ["CC1.2", "CC1.3"]}, "risk_category": "Governance"},
    {"section": "Organization & Management (CC1)", "question_text": "Does your organization maintain an organizational chart that clearly defines reporting relationships for security functions?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {"SOC2": ["CC1.3"]}, "risk_category": "Governance"},
    {"section": "Organization & Management (CC1)", "question_text": "Does your organization have a formal code of conduct or ethics policy that employees must acknowledge?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {"SOC2": ["CC1.1"]}, "risk_category": "Governance"},
    {"section": "Communications & Information (CC2)", "question_text": "Do you have documented policies and procedures for communicating security responsibilities to employees?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": "This includes onboarding materials, security awareness training, etc.", "compliance_mapping": {"SOC2": ["CC2.1", "CC2.2"]}, "risk_category": "Governance"},
    {"section": "Communications & Information (CC2)", "question_text": "Is there a formal process for communicating security incidents, breaches, or policy violations to affected parties?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": "This should include customers, regulators, and internal stakeholders as appropriate.", "compliance_mapping": {"SOC2": ["CC2.3"]}, "risk_category": "Incident Response"},
    {"section": "Communications & Information (CC2)", "question_text": "Do you maintain documentation of your system components, boundaries, and data flows?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": "System descriptions, architecture diagrams, data flow diagrams, etc.", "compliance_mapping": {"SOC2": ["CC2.1"]}, "risk_category": "Documentation"},
    {"section": "Risk Assessment (CC3)", "question_text": "Does your organization perform formal risk assessments at least annually?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": "Risk assessments should identify, analyze, and evaluate information security risks.", "compliance_mapping": {"SOC2": ["CC3.1", "CC3.2"]}, "risk_category": "Risk Management"},
    {"section": "Risk Assessment (CC3)", "question_text": "Do you maintain a risk register that tracks identified risks, their likelihood, impact, and mitigation status?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {"SOC2": ["CC3.2", "CC3.4"]}, "risk_category": "Risk Management"},
    {"section": "Risk Assessment (CC3)", "question_text": "Are third-party/vendor risks included in your risk assessment process?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": "Vendors with access to your systems or data should be assessed for risk.", "compliance_mapping": {"SOC2": ["CC3.3", "CC9.2"]}, "risk_category": "Third Party Risk"},
    {"section": "Logical & Physical Access (CC6)", "question_text": "Do you require multi-factor authentication (MFA) for all user access to production systems?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": "MFA significantly reduces the risk of unauthorized access from compromised credentials.", "compliance_mapping": {"SOC2": ["CC6.1", "CC6.2"]}, "risk_category": "Access Control"},
    {"section": "Logical & Physical Access (CC6)", "question_text": "Is access to systems and data granted based on the principle of least privilege?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": "Users should only have access to the minimum resources needed for their job function.", "compliance_mapping": {"SOC2": ["CC6.1", "CC6.3"]}, "risk_category": "Access Control"},
    {"section": "Logical & Physical Access (CC6)", "question_text": "Are user access reviews performed at least quarterly to verify appropriate access levels?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {"SOC2": ["CC6.2", "CC6.3"]}, "risk_category": "Access Control"},
    {"section": "Logical & Physical Access (CC6)", "question_text": "Is there a formal process for provisioning and deprovisioning user access (onboarding/offboarding)?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": "Terminated employees should have access revoked within 24 hours.", "compliance_mapping": {"SOC2": ["CC6.2"]}, "risk_category": "Access Control"},
    {"section": "Logical & Physical Access (CC6)", "question_text": "Is data encrypted in transit using TLS 1.2 or higher?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {"SOC2": ["CC6.1", "CC6.7"]}, "risk_category": "Encryption"},
    {"section": "Logical & Physical Access (CC6)", "question_text": "Is sensitive data encrypted at rest using AES-256 or equivalent?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {"SOC2": ["CC6.1", "CC6.7"]}, "risk_category": "Encryption"},
    {"section": "System Operations (CC7)", "question_text": "Do you perform vulnerability scanning on systems at least quarterly?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": "External and internal vulnerability scanning should be performed regularly.", "compliance_mapping": {"SOC2": ["CC7.1"]}, "risk_category": "Vulnerability Management"},
    {"section": "System Operations (CC7)", "question_text": "Do you perform penetration testing at least annually?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": "Penetration testing should be performed by qualified internal or external resources.", "compliance_mapping": {"SOC2": ["CC7.1"]}, "risk_category": "Vulnerability Management"},
    {"section": "System Operations (CC7)", "question_text": "Is there a patch management process to apply security updates within defined timeframes?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": "Critical patches should be applied within 30 days; high within 60 days.", "compliance_mapping": {"SOC2": ["CC7.1"]}, "risk_category": "Vulnerability Management"},
    {"section": "System Operations (CC7)", "question_text": "Are security events and logs monitored in real-time or near real-time?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": "SIEM or equivalent security monitoring tools should be in place.", "compliance_mapping": {"SOC2": ["CC7.2", "CC7.3"]}, "risk_category": "Monitoring"},
    {"section": "Change Management (CC8)", "question_text": "Is there a formal change management process for all changes to production systems?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": "Changes should be documented, tested, approved, and tracked.", "compliance_mapping": {"SOC2": ["CC8.1"]}, "risk_category": "Change Management"},
    {"section": "Change Management (CC8)", "question_text": "Are changes tested in a non-production environment before deployment?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {"SOC2": ["CC8.1"]}, "risk_category": "Change Management"},
    {"section": "Risk Mitigation (CC9)", "question_text": "Do you have a documented incident response plan?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": "The plan should define roles, procedures, and communication protocols for security incidents.", "compliance_mapping": {"SOC2": ["CC9.1"]}, "risk_category": "Incident Response"},
    {"section": "Risk Mitigation (CC9)", "question_text": "Is the incident response plan tested at least annually (tabletop exercise or simulation)?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {"SOC2": ["CC9.1"]}, "risk_category": "Incident Response"},
    {"section": "Risk Mitigation (CC9)", "question_text": "Do you have a business continuity plan (BCP) and disaster recovery plan (DRP)?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {"SOC2": ["CC9.1"]}, "risk_category": "Business Continuity"},
    {"section": "Risk Mitigation (CC9)", "question_text": "Are BCP/DRP plans tested at least annually?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {"SOC2": ["CC9.1"]}, "risk_category": "Business Continuity"},
    {"section": "Risk Mitigation (CC9)", "question_text": "Are data backups performed regularly and tested for recoverability?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": "Backups should be encrypted and stored in a separate location.", "compliance_mapping": {"SOC2": ["CC9.1"]}, "risk_category": "Business Continuity"},
    {"section": "Vendor Management (CC9)", "question_text": "Do you perform security assessments of your subcontractors and third-party service providers?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {"SOC2": ["CC9.2"]}, "risk_category": "Third Party Risk"},
    {"section": "Vendor Management (CC9)", "question_text": "Do contracts with third parties include security and confidentiality requirements?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {"SOC2": ["CC9.2"]}, "risk_category": "Third Party Risk"},
    {"section": "Security Awareness (Additional)", "question_text": "Do all employees receive security awareness training upon hire and at least annually thereafter?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {"SOC2": ["CC1.4", "CC2.2"]}, "risk_category": "Training"},
    {"section": "Security Awareness (Additional)", "question_text": "Are employees trained to identify and report phishing attempts?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": "Phishing simulations are recommended.", "compliance_mapping": {"SOC2": ["CC2.2"]}, "risk_category": "Training"}
  ]'::jsonb
)
ON CONFLICT (seed_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  framework = EXCLUDED.framework,
  questions = EXCLUDED.questions;

-- QUICK ASSESSMENT TEMPLATE
INSERT INTO questionnaire_template_seeds (seed_key, name, description, framework, questions)
VALUES (
  'quick_assessment',
  'Quick Security Assessment',
  'Streamlined 15-question assessment for low-risk vendors or initial screening.',
  'Basic Security',
  '[
    {"section": "Security Governance", "question_text": "Does your organization have a documented information security policy?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {}, "risk_category": "Governance"},
    {"section": "Security Governance", "question_text": "Is there a designated individual responsible for information security?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {}, "risk_category": "Governance"},
    {"section": "Access Control", "question_text": "Do you require multi-factor authentication for access to systems containing customer data?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {}, "risk_category": "Access Control"},
    {"section": "Access Control", "question_text": "Is access to systems and data granted based on the principle of least privilege?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {}, "risk_category": "Access Control"},
    {"section": "Access Control", "question_text": "Is there a process to revoke access when employees leave the organization?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {}, "risk_category": "Access Control"},
    {"section": "Data Protection", "question_text": "Is customer data encrypted in transit (TLS 1.2+)?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {}, "risk_category": "Encryption"},
    {"section": "Data Protection", "question_text": "Is customer data encrypted at rest?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {}, "risk_category": "Encryption"},
    {"section": "Data Protection", "question_text": "Are data backups performed regularly and stored securely?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {}, "risk_category": "Business Continuity"},
    {"section": "Vulnerability Management", "question_text": "Do you perform vulnerability scanning or penetration testing at least annually?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {}, "risk_category": "Vulnerability Management"},
    {"section": "Vulnerability Management", "question_text": "Is there a process to apply security patches in a timely manner?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {}, "risk_category": "Vulnerability Management"},
    {"section": "Incident Response", "question_text": "Do you have a documented incident response plan?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {}, "risk_category": "Incident Response"},
    {"section": "Incident Response", "question_text": "Will you notify us within 72 hours of discovering a security incident affecting our data?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {}, "risk_category": "Incident Response"},
    {"section": "Compliance", "question_text": "Does your organization hold any security certifications (SOC 2, ISO 27001, etc.)?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": "If yes, please provide copies of current reports/certificates.", "compliance_mapping": {}, "risk_category": "Compliance"},
    {"section": "Compliance", "question_text": "Are background checks performed on employees with access to customer data?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {}, "risk_category": "HR Security"},
    {"section": "Compliance", "question_text": "Do employees receive security awareness training?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {}, "risk_category": "Training"}
  ]'::jsonb
)
ON CONFLICT (seed_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  framework = EXCLUDED.framework,
  questions = EXCLUDED.questions;

-- SAAS VENDOR TEMPLATE
INSERT INTO questionnaire_template_seeds (seed_key, name, description, framework, questions)
VALUES (
  'saas_vendor',
  'SaaS Vendor Assessment',
  'Comprehensive assessment for cloud software providers including SOC 2, data handling, and business continuity.',
  'SOC 2, GDPR',
  '[
    {"section": "Company Information", "question_text": "Please provide your company''s legal name and headquarters location.", "question_type": "text_long", "options": {}, "is_required": true, "weight": 1, "help_text": null, "compliance_mapping": {}, "risk_category": "General"},
    {"section": "Company Information", "question_text": "How long has your company been in business?", "question_type": "single_choice", "options": {"choices": ["Less than 1 year", "1-3 years", "3-5 years", "5-10 years", "More than 10 years"]}, "is_required": true, "weight": 1, "help_text": null, "compliance_mapping": {}, "risk_category": "General"},
    {"section": "Company Information", "question_text": "Do you have SOC 2 Type II certification?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "In Progress"]}, "is_required": true, "weight": 3, "help_text": "If yes, please provide a copy of the most recent report.", "compliance_mapping": {"SOC2": ["All"]}, "risk_category": "Compliance"},
    {"section": "Data Handling", "question_text": "What types of data will you process on our behalf?", "question_type": "multi_choice", "options": {"choices": ["Personal Information (PII)", "Financial Data", "Health Information (PHI)", "Intellectual Property", "Authentication Credentials", "None of the above"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {}, "risk_category": "Data Classification"},
    {"section": "Data Handling", "question_text": "Where is customer data stored geographically?", "question_type": "multi_choice", "options": {"choices": ["United States", "European Union", "United Kingdom", "Canada", "Australia", "Other"]}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {"GDPR": ["Art. 44-49"]}, "risk_category": "Data Residency"},
    {"section": "Data Handling", "question_text": "Do you use any sub-processors to process customer data?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": "If yes, please provide a list of sub-processors.", "compliance_mapping": {"GDPR": ["Art. 28"]}, "risk_category": "Third Party Risk"},
    {"section": "Data Handling", "question_text": "Can customer data be exported upon request in a standard format (CSV, JSON, etc.)?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {"GDPR": ["Art. 20"]}, "risk_category": "Data Portability"},
    {"section": "Data Handling", "question_text": "Is customer data permanently deleted upon contract termination? If so, within what timeframe?", "question_type": "text_long", "options": {}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {"GDPR": ["Art. 17"]}, "risk_category": "Data Retention"},
    {"section": "Security Controls", "question_text": "Is multi-factor authentication available for all user accounts?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "Optional"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {"SOC2": ["CC6.1"]}, "risk_category": "Access Control"},
    {"section": "Security Controls", "question_text": "Does your platform support Single Sign-On (SSO) via SAML or OIDC?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "Roadmap"]}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {}, "risk_category": "Access Control"},
    {"section": "Security Controls", "question_text": "Is all data encrypted in transit using TLS 1.2 or higher?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {"SOC2": ["CC6.7"]}, "risk_category": "Encryption"},
    {"section": "Security Controls", "question_text": "Is customer data encrypted at rest using AES-256 or equivalent?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {"SOC2": ["CC6.7"]}, "risk_category": "Encryption"},
    {"section": "Security Controls", "question_text": "Do you perform regular vulnerability assessments and penetration testing?", "question_type": "single_choice", "options": {"choices": ["Quarterly or more frequently", "Annually", "Less than annually", "Never"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {"SOC2": ["CC7.1"]}, "risk_category": "Vulnerability Management"},
    {"section": "Availability", "question_text": "What is your documented uptime SLA?", "question_type": "single_choice", "options": {"choices": ["99.99% or higher", "99.9%", "99.5%", "99%", "No SLA"]}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {}, "risk_category": "Availability"},
    {"section": "Availability", "question_text": "Do you have a public status page showing current and historical uptime?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 1, "help_text": "If yes, please provide the URL.", "compliance_mapping": {}, "risk_category": "Availability"},
    {"section": "Availability", "question_text": "What is your Recovery Time Objective (RTO) and Recovery Point Objective (RPO)?", "question_type": "text_long", "options": {}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {}, "risk_category": "Business Continuity"},
    {"section": "Incident Response", "question_text": "Do you have a documented security incident response plan?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {"SOC2": ["CC9.1"]}, "risk_category": "Incident Response"},
    {"section": "Incident Response", "question_text": "What is your contractual commitment for notifying customers of security incidents?", "question_type": "single_choice", "options": {"choices": ["Within 24 hours", "Within 48 hours", "Within 72 hours", "No commitment"]}, "is_required": true, "weight": 3, "help_text": null, "compliance_mapping": {}, "risk_category": "Incident Response"},
    {"section": "Incident Response", "question_text": "Have you experienced any security breaches in the past 3 years?", "question_type": "yes_no_na", "options": {"choices": ["Yes", "No", "N/A"]}, "is_required": true, "weight": 3, "help_text": "If yes, please provide details.", "compliance_mapping": {}, "risk_category": "Incident Response"},
    {"section": "Compliance", "question_text": "What security certifications or attestations do you currently hold?", "question_type": "multi_choice", "options": {"choices": ["SOC 2 Type II", "ISO 27001", "HIPAA", "PCI DSS", "FedRAMP", "None"]}, "is_required": true, "weight": 2, "help_text": null, "compliance_mapping": {}, "risk_category": "Compliance"}
  ]'::jsonb
)
ON CONFLICT (seed_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  framework = EXCLUDED.framework,
  questions = EXCLUDED.questions;