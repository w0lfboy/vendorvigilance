import { Shield, FileText, CheckCircle, BarChart3, Brain, Target, Users, Zap, TrendingUp, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import logo from '@/assets/logo.png';

export default function InvestorPitch() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img src={logo} alt="VendorVigilance" className="w-16 h-16 rounded-xl" />
            <span className="text-4xl md:text-5xl font-bold text-foreground">VendorVigilance</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 max-w-4xl mx-auto">
            AI-Powered Third-Party Risk Management
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12">
            Enterprise-Grade Security. Mid-Market Pricing.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Assessments</p>
              <p className="text-3xl font-bold text-success">80% Faster</p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Cost vs Enterprise</p>
              <p className="text-3xl font-bold text-success">75% Less</p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Time to Value</p>
              <p className="text-3xl font-bold text-success">1 Day</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <Badge variant="outline" className="mb-4 text-primary border-primary">The Problem</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            Third-Party Risk is Exploding, But Solutions Are Broken
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { stat: '200-1,000', title: 'Vendors Per Company', desc: 'Each one a potential breach vector that needs assessment and monitoring' },
              { stat: '83%', title: 'Say Methods Too Complex', desc: 'Security teams drowning in spreadsheets and manual questionnaire reviews' },
              { stat: '9%', title: 'Have Mature TPRM', desc: 'Most organizations lack the capabilities to effectively manage vendor risk' },
              { stat: '$25K+', title: 'Enterprise Tool Pricing', desc: 'Mid-market companies priced out, stuck between spreadsheets and budget constraints' },
            ].map((item, i) => (
              <Card key={i} className="border-l-4 border-l-destructive bg-secondary">
                <CardContent className="p-6">
                  <p className="text-4xl font-extrabold text-primary mb-2">{item.stat}</p>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Market Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Badge variant="outline" className="mb-4 text-primary border-primary">The Market</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            $9B Market Growing 15%+ Annually
          </h2>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center">
              <div className="mb-8">
                <p className="text-sm text-muted-foreground mb-2">2025 Market Size</p>
                <p className="text-6xl md:text-7xl font-extrabold text-primary">$9<span className="text-3xl">B</span></p>
              </div>
              <TrendingUp className="w-12 h-12 text-success mx-auto my-4" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">2030 Projection</p>
                <p className="text-6xl md:text-7xl font-extrabold text-primary">$20<span className="text-3xl">B</span></p>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground">Key Market Drivers</h3>
              {[
                { icon: FileText, title: 'Regulatory Pressure', desc: 'SOC 2, ISO 27001, GDPR, DORA, HIPAA, PCI-DSS requirements expanding' },
                { icon: Shield, title: 'Supply Chain Attacks', desc: 'Third-party breaches now account for majority of data incidents' },
                { icon: Zap, title: 'Cloud Adoption', desc: '70% cloud deployment accelerating SaaS-based TPRM solutions' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <Badge variant="outline" className="mb-4 text-primary border-primary">The Solution</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            AI-Powered Automation for Every Stage
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Brain, title: 'AI Risk Scoring', desc: 'Auto-analyze questionnaire responses and generate risk scores in seconds, not days' },
              { icon: FileText, title: 'Document Analysis', desc: 'Extract key findings from SOC 2 reports, ISO certifications, and security policies automatically' },
              { icon: CheckCircle, title: 'Compliance Mapping', desc: 'Map vendor responses to SOC 2, ISO 27001, GDPR, and other framework controls' },
              { icon: BarChart3, title: 'Board-Ready Reports', desc: 'Generate executive summaries and risk assessments on demand with one click' },
            ].map((item, i) => (
              <div key={i} className="gradient-primary rounded-xl p-8 text-foreground">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Badge variant="outline" className="mb-4 text-primary border-primary">What We've Built</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            Working MVP — Not a Mockup
          </h2>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
              {[
                'Authentication & RBAC',
                'Vendor Management',
                'Assessment Workflows',
                'Questionnaire Templates',
                'Vendor Portal',
                'AI Risk Analysis',
                '6 Report Types',
                'Document Storage',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border">
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-success-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{feature}</span>
                </div>
              ))}
            </div>
            <div className="gradient-primary rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-semibold text-foreground mb-4">Real Backend, Real AI</h3>
              <p className="text-muted-foreground mb-6">
                Live Supabase database with Claude-powered risk analysis running in production
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {['React + TypeScript', 'Supabase', 'Claude AI', 'Edge Functions'].map((tech, i) => (
                  <Badge key={i} variant="secondary" className="bg-white/20 text-foreground border-0">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <Badge variant="outline" className="mb-4 text-primary border-primary">Business Model</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            Simple SaaS, Clear Path to Profitability
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center relative bg-secondary border-border">
              <CardContent className="p-8">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Starter</p>
                <p className="text-5xl font-extrabold text-foreground mb-1">$299</p>
                <p className="text-sm text-muted-foreground mb-4">/month</p>
                <p className="text-sm text-muted-foreground">Up to 100 vendors, 3 users</p>
              </CardContent>
            </Card>
            <Card className="text-center relative gradient-primary border-0 transform md:scale-105">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-success-foreground">
                Most Popular
              </Badge>
              <CardContent className="p-8">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Professional</p>
                <p className="text-5xl font-extrabold text-foreground mb-1">$499</p>
                <p className="text-sm text-muted-foreground mb-4">/month</p>
                <p className="text-sm text-muted-foreground">Up to 500 vendors, 10 users</p>
              </CardContent>
            </Card>
            <Card className="text-center relative bg-secondary border-border">
              <CardContent className="p-8">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Enterprise</p>
                <p className="text-5xl font-extrabold text-foreground mb-1">Custom</p>
                <p className="text-sm text-muted-foreground mb-4">contact us</p>
                <p className="text-sm text-muted-foreground">Unlimited vendors, SSO, dedicated support</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-success/10 rounded-xl p-6 text-center">
              <p className="text-xs font-semibold uppercase text-success mb-2">Target Gross Margin</p>
              <p className="text-4xl font-extrabold text-success">80%+</p>
            </div>
            <div className="bg-primary/10 rounded-xl p-6 text-center">
              <p className="text-xs font-semibold uppercase text-primary mb-2">Path to $50K MRR</p>
              <p className="text-4xl font-extrabold text-primary">125</p>
              <p className="text-sm text-primary">customers @ $400 avg</p>
            </div>
            <div className="bg-warning/10 rounded-xl p-6 text-center">
              <p className="text-xs font-semibold uppercase text-warning mb-2">Break-Even</p>
              <p className="text-4xl font-extrabold text-warning">1 customer</p>
              <p className="text-sm text-warning">covers infra 4x over</p>
            </div>
          </div>
        </div>
      </section>

      {/* Competition Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Badge variant="outline" className="mb-4 text-primary border-primary">Competition</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            A Clear Gap in the Mid-Market
          </h2>
          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse bg-card rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="p-4 text-left font-semibold">Competitor</th>
                  <th className="p-4 text-left font-semibold">Price/Year</th>
                  <th className="p-4 text-left font-semibold">Target</th>
                  <th className="p-4 text-left font-semibold">Weakness</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-4 text-foreground">SecurityScorecard</td>
                  <td className="p-4 text-destructive font-semibold">$25,000+</td>
                  <td className="p-4 text-muted-foreground">Enterprise</td>
                  <td className="p-4 text-muted-foreground">Price excludes mid-market</td>
                </tr>
                <tr className="border-b border-border bg-secondary/50">
                  <td className="p-4 text-foreground">OneTrust</td>
                  <td className="p-4 text-destructive font-semibold">$44,000+</td>
                  <td className="p-4 text-muted-foreground">Enterprise</td>
                  <td className="p-4 text-muted-foreground">Complex, GRC-first</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 text-foreground">ProcessUnity</td>
                  <td className="p-4 text-destructive font-semibold">$15,000+</td>
                  <td className="p-4 text-muted-foreground">Mid-Enterprise</td>
                  <td className="p-4 text-muted-foreground">Limited AI, slow setup</td>
                </tr>
                <tr className="border-b border-border bg-secondary/50">
                  <td className="p-4 text-foreground">Vanta / Drata</td>
                  <td className="p-4 text-warning font-semibold">$7,500-11,500</td>
                  <td className="p-4 text-muted-foreground">Startups, SMB</td>
                  <td className="p-4 text-muted-foreground">TPRM is add-on, not core</td>
                </tr>
                <tr className="bg-success text-success-foreground font-semibold">
                  <td className="p-4">VendorVigilance</td>
                  <td className="p-4">$3,600-6,000</td>
                  <td className="p-4">SMB + Mid-Market</td>
                  <td className="p-4">AI-First TPRM</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-warning/10 border-l-4 border-warning rounded-xl p-6">
              <h3 className="text-sm font-bold uppercase text-warning mb-2">The Gap</h3>
              <p className="text-foreground">
                No TPRM-native solution between $3,600 and $15,000/year for mid-market companies with 50-500 employees.
              </p>
            </div>
            <div className="gradient-primary rounded-xl p-6">
              <h3 className="text-sm font-bold uppercase text-success mb-2">Our Advantage</h3>
              <p className="text-foreground">
                AI-native architecture built ground-up. Competitors are retrofitting AI onto legacy systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <Badge variant="outline" className="mb-4 text-primary border-primary">Roadmap</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            Path to $50K+ MRR
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { quarter: 'Q1 2025', title: 'MVP + Design Partners', items: ['Production-ready platform', '5 design partners signed', 'First paying customer'] },
              { quarter: 'Q2 2025', title: '$5-10K MRR', items: ['Convert design partners', 'Founder-led sales', 'Seed round close'] },
              { quarter: 'Q3 2025', title: '$25K MRR', items: ['SSO + Enterprise features', 'First enterprise customer', 'Hire engineer #1'] },
              { quarter: 'Q4 2025', title: '$50K+ MRR', items: ['Series A ready', '50+ customers', 'Integrations ecosystem'] },
            ].map((item, i) => (
              <Card key={i} className="relative bg-secondary border-border">
                <CardContent className="p-6">
                  <Badge className="mb-4 bg-primary text-primary-foreground">{item.quarter}</Badge>
                  <h3 className="text-lg font-bold text-primary mb-4">{item.title}</h3>
                  <ul className="space-y-2">
                    {item.items.map((li, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ArrowRight className="w-4 h-4 text-success" />
                        {li}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Badge variant="outline" className="mb-4 text-primary border-primary">Founder</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            Security Practitioner + Product Builder
          </h2>
          <div className="grid lg:grid-cols-3 gap-12 items-center">
            <div className="flex justify-center">
              <div className="w-48 h-48 gradient-primary rounded-3xl flex items-center justify-center">
                <Users className="w-20 h-20 text-muted-foreground/30" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold text-primary mb-4">[Your Name]</h3>
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge variant="secondary">Product Manager @ Cybersecurity Startup</Badge>
                <Badge variant="secondary">Founder, Penetration Testing LLC</Badge>
              </div>
              <blockquote className="text-lg italic text-muted-foreground border-l-4 border-primary pl-6">
                "I've been on both sides — managing vendor risk at a growing company and filling out endless questionnaires as a vendor. The tools are either too expensive or not built for the job. VendorVigilance fixes that."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Strategic Partners, Not Just Capital
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            We're looking for investors who understand security and can open doors
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { title: 'Design Partners', desc: 'Introductions to 3-5 security teams from your LP network' },
              { title: 'Market Feedback', desc: 'Insights on positioning and pricing from investors who know security buyers' },
              { title: 'Seed Investment', desc: '$500K-$1M when we hit $5-10K MRR' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-2xl font-semibold text-foreground mb-2">We're hackers and hustlers.</p>
          <p className="text-muted-foreground mb-8">Let's build something together.</p>
          <div className="text-sm text-muted-foreground">
            <a href="mailto:your@email.com" className="text-foreground hover:text-primary transition-colors">[your@email.com]</a>
            <span className="mx-2">·</span>
            <a href="#" className="text-foreground hover:text-primary transition-colors">[LinkedIn]</a>
          </div>
        </div>
      </section>
    </div>
  );
}
