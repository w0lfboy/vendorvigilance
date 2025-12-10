import { Shield, FileText, CheckCircle, BarChart3, Brain, Target, Users, Zap, TrendingUp, Clock, DollarSign, ArrowRight, Milestone, Calculator, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import logo from '@/assets/logo.png';
import founderHeadshot from '@/assets/founder-headshot.jpg';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
const fadeInUp = {
  initial: {
    opacity: 0,
    y: 40
  },
  whileInView: {
    opacity: 1,
    y: 0
  },
  viewport: {
    once: true,
    margin: "-100px"
  },
  transition: {
    duration: 0.6,
    ease: [0.25, 0.46, 0.45, 0.94] as const
  }
};
const scaleIn = {
  initial: {
    opacity: 0,
    scale: 0.9
  },
  whileInView: {
    opacity: 1,
    scale: 1
  },
  viewport: {
    once: true,
    margin: "-100px"
  },
  transition: {
    duration: 0.5,
    ease: [0.25, 0.46, 0.45, 0.94] as const
  }
};
const staggerChildren = {
  initial: {
    opacity: 0
  },
  whileInView: {
    opacity: 1
  },
  viewport: {
    once: true,
    margin: "-100px"
  },
  transition: {
    staggerChildren: 0.1
  }
};
const staggerItem = {
  initial: {
    opacity: 0,
    y: 20
  },
  whileInView: {
    opacity: 1,
    y: 0
  },
  transition: {
    duration: 0.4
  }
};

// Data for charts
const revenueProjection = [{
  month: 'Q1',
  mrr: 5,
  customers: 10
}, {
  month: 'Q2',
  mrr: 15,
  customers: 35
}, {
  month: 'Q3',
  mrr: 35,
  customers: 75
}, {
  month: 'Q4',
  mrr: 60,
  customers: 130
}, {
  month: 'Q1+',
  mrr: 100,
  customers: 200
}];
const marketGrowth = [{
  year: '2024',
  tam: 7.5
}, {
  year: '2025',
  tam: 9
}, {
  year: '2026',
  tam: 10.5
}, {
  year: '2027',
  tam: 12.5
}, {
  year: '2028',
  tam: 15
}, {
  year: '2029',
  tam: 17.5
}, {
  year: '2030',
  tam: 20
}];
const unitEconomics = [{
  metric: 'CAC',
  value: 800,
  target: 600
}, {
  metric: 'LTV',
  value: 4800,
  target: 7200
}, {
  metric: 'ARPU',
  value: 400,
  target: 500
}, {
  metric: 'Payback',
  value: 2,
  target: 1.5
}];
export default function InvestorPitch() {
  return <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <motion.div className="container mx-auto px-4 md:px-6 relative z-10 text-center" initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8
      }}>
          <motion.div className="flex items-center justify-center gap-4 mb-8" initial={{
          scale: 0.8,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} transition={{
          delay: 0.2,
          duration: 0.5
        }}>
            <img src={logo} alt="VendorVigilance" className="w-12 h-12 md:w-16 md:h-16 rounded-xl" />
            <span className="text-2xl md:text-5xl font-bold text-foreground">VendorVigilance</span>
          </motion.div>
          <motion.h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 max-w-4xl mx-auto" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.4,
          duration: 0.6
        }}>
            AI-Powered Third-Party Risk Management
          </motion.h1>
          <motion.p className="text-lg md:text-2xl text-muted-foreground mb-8 md:mb-12" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.6,
          duration: 0.6
        }}>Enterprise-Grade Vendor Management at a Fraction of the Cost.</motion.p>
          <motion.div className="flex flex-wrap justify-center gap-3 md:gap-6" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.8,
          duration: 0.6
        }}>
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 md:p-6 text-center">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Assessments</p>
              <p className="text-xl md:text-3xl font-bold text-success">80% Faster</p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 md:p-6 text-center">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Cost vs Enterprise</p>
              <p className="text-xl md:text-3xl font-bold text-success">75% Less</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 md:p-6 text-center cursor-help relative group">
                    <Info className="absolute top-2 right-2 w-3 h-3 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">Time to Value</p>
                    <p className="text-xl md:text-3xl font-bold text-success">1 Day</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs p-3 bg-card border border-border">
                  <p className="text-sm text-foreground font-medium mb-1">What "1 Day" means:</p>
                  <p className="text-xs text-muted-foreground">Sign up this morning, add vendors, send your first assessment, get AI-analyzed results by end of day.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        </motion.div>
      </section>

      {/* Problem Section */}
      <motion.section className="py-16 md:py-20 bg-card" {...fadeInUp}>
        <div className="container mx-auto px-4 md:px-6">
          <Badge variant="outline" className="mb-4 text-primary border-primary">The Problem</Badge>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-8 md:mb-12">
            Third-Party Risk is Exploding, But Solutions Are Broken
          </h2>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" {...staggerChildren}>
            {[{
            stat: '200-1,000',
            title: 'Vendors Per Company',
            desc: 'Each one a potential breach vector that needs assessment and monitoring'
          }, {
            stat: '83%',
            title: 'Say Methods Too Complex',
            desc: 'Security teams drowning in spreadsheets and manual questionnaire reviews'
          }, {
            stat: '9%',
            title: 'Have Mature TPRM',
            desc: 'Most organizations lack the capabilities to effectively manage vendor risk'
          }, {
            stat: '$25K+',
            title: 'Enterprise Tool Pricing',
            desc: 'Mid-market companies priced out, stuck between spreadsheets and budget constraints'
          }].map((item, i) => <motion.div key={i} {...staggerItem}>
                <Card className="border-l-4 border-l-destructive bg-secondary h-full">
                  <CardContent className="p-6">
                    <p className="text-4xl font-extrabold text-primary mb-2">{item.stat}</p>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>)}
          </motion.div>
        </div>
      </motion.section>

      {/* Market Section with Chart */}
      <motion.section className="py-20" {...fadeInUp}>
        <div className="container mx-auto px-6">
          <Badge variant="outline" className="mb-4 text-primary border-primary">The Market</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            $9B Market Growing 15%+ Annually
          </h2>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...scaleIn}>
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">TPRM Market Size Projection ($B)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={marketGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <RechartsTooltip contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} />
                    <Area type="monotone" dataKey="tam" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.3)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground">Key Market Drivers</h3>
              {[{
              icon: FileText,
              title: 'Regulatory Pressure',
              desc: 'SOC 2, ISO 27001, GDPR, DORA, HIPAA, PCI-DSS requirements expanding'
            }, {
              icon: Shield,
              title: 'Supply Chain Attacks',
              desc: 'Third-party breaches now account for majority of data incidents'
            }, {
              icon: Zap,
              title: 'Cloud Adoption',
              desc: '70% cloud deployment accelerating SaaS-based TPRM solutions'
            }].map((item, i) => <motion.div key={i} className="flex gap-4" initial={{
              opacity: 0,
              x: -20
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: i * 0.1,
              duration: 0.4
            }}>
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>)}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Solution Section */}
      <motion.section className="py-20 bg-card" {...fadeInUp}>
        <div className="container mx-auto px-6">
          <Badge variant="outline" className="mb-4 text-primary border-primary">The Solution</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            AI-Powered Automation for Every Stage
          </h2>
          <motion.div className="grid md:grid-cols-2 gap-6" {...staggerChildren}>
            {[{
            icon: Brain,
            title: 'AI Risk Scoring',
            desc: 'Auto-analyze questionnaire responses and generate risk scores in seconds, not days'
          }, {
            icon: FileText,
            title: 'Document Analysis',
            desc: 'Extract key findings from SOC 2 reports, ISO certifications, and security policies automatically'
          }, {
            icon: CheckCircle,
            title: 'Compliance Mapping',
            desc: 'Map vendor responses to SOC 2, ISO 27001, GDPR, and other framework controls'
          }, {
            icon: BarChart3,
            title: 'Board-Ready Reports',
            desc: 'Generate executive summaries and risk assessments on demand with one click'
          }].map((item, i) => <motion.div key={i} className="gradient-primary rounded-xl p-8 text-foreground" whileHover={{
            scale: 1.02,
            transition: {
              duration: 0.2
            }
          }} {...staggerItem}>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>)}
          </motion.div>
        </div>
      </motion.section>

      {/* Product Section */}
      <motion.section className="py-20" {...fadeInUp}>
        <div className="container mx-auto px-6">
          <Badge variant="outline" className="mb-4 text-primary border-primary">What We've Built</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            Working MVP — Not a Mockup
          </h2>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div className="grid grid-cols-2 gap-4" {...staggerChildren}>
              {['Authentication & RBAC', 'Vendor Management', 'Assessment Workflows', 'Questionnaire Templates', 'Vendor Portal', 'AI Risk Analysis', '6 Report Types', 'Document Storage'].map((feature, i) => <motion.div key={i} className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border" {...staggerItem} whileHover={{
              scale: 1.03,
              transition: {
                duration: 0.2
              }
            }}>
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-success-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{feature}</span>
                </motion.div>)}
            </motion.div>
            <motion.div className="gradient-primary rounded-2xl p-8 text-center" {...scaleIn}>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Real Backend, Real AI</h3>
              <p className="text-muted-foreground mb-6">
                Live Supabase database with Claude-powered risk analysis running in production
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {['React + TypeScript', 'Supabase', 'Claude AI', 'Edge Functions'].map((tech, i) => <Badge key={i} variant="secondary" className="bg-white/20 text-foreground border-0">
                    {tech}
                  </Badge>)}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Pricing & Path to Profitability Section */}
      <motion.section className="py-20 bg-card" {...fadeInUp}>
        <div className="container mx-auto px-6">
          <Badge variant="outline" className="mb-4 text-primary border-primary">Business Model</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            Simple SaaS, Clear Path to Profitability
          </h2>
          
          {/* Pricing Tiers */}
          <motion.div className="grid md:grid-cols-3 gap-6 mb-12" {...staggerChildren}>
            <motion.div {...staggerItem}>
              <Card className="text-center relative bg-secondary border-border h-full">
                <CardContent className="p-8">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Starter</p>
                  <p className="text-5xl font-extrabold text-foreground mb-1">$299</p>
                  <p className="text-sm text-muted-foreground mb-4">/month</p>
                  <p className="text-sm text-muted-foreground">Up to 100 vendors, 3 users</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div {...staggerItem}>
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
            </motion.div>
            <motion.div {...staggerItem}>
              <Card className="text-center relative bg-secondary border-border h-full">
                <CardContent className="p-8">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Enterprise</p>
                  <p className="text-5xl font-extrabold text-foreground mb-1">Custom</p>
                  <p className="text-sm text-muted-foreground mb-4">contact us</p>
                  <p className="text-sm text-muted-foreground">Unlimited vendors, SSO, dedicated support</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Revenue Projection Chart */}
          <motion.div className="grid lg:grid-cols-2 gap-8 mb-12" {...scaleIn}>
            <div className="bg-secondary rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Projected MRR Growth ($K)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueProjection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <RechartsTooltip contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} />
                  <Line type="monotone" dataKey="mrr" stroke="hsl(var(--success))" strokeWidth={3} dot={{
                  fill: 'hsl(var(--success))',
                  strokeWidth: 2
                }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-secondary rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Customer Growth</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueProjection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <RechartsTooltip contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} />
                  <Bar dataKey="customers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div className="grid md:grid-cols-4 gap-6" {...staggerChildren}>
            <motion.div className="bg-success/10 rounded-xl p-6 text-center" {...staggerItem}>
              <p className="text-xs font-semibold uppercase text-success mb-2">Target Gross Margin</p>
              <p className="text-4xl font-extrabold text-success">80%+</p>
            </motion.div>
            <motion.div className="bg-primary/10 rounded-xl p-6 text-center" {...staggerItem}>
              <p className="text-xs font-semibold uppercase text-primary mb-2">LTV:CAC Ratio</p>
              <p className="text-4xl font-extrabold text-primary">6:1</p>
              <p className="text-sm text-primary">Target</p>
            </motion.div>
            <motion.div className="bg-warning/10 rounded-xl p-6 text-center" {...staggerItem}>
              <p className="text-xs font-semibold uppercase text-warning mb-2">Payback Period</p>
              <p className="text-4xl font-extrabold text-warning">&lt;2 mo</p>
            </motion.div>
            <motion.div className="bg-success/10 rounded-xl p-6 text-center" {...staggerItem}>
              <p className="text-xs font-semibold uppercase text-success mb-2">Break-Even</p>
              <p className="text-4xl font-extrabold text-success">~25</p>
              <p className="text-sm text-success">customers</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Path to Profitability Section */}
      <motion.section className="py-20" {...fadeInUp}>
        <div className="container mx-auto px-6">
          <Badge variant="outline" className="mb-4 text-success border-success">Path to Profitability</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Capital-Efficient Growth Strategy
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
            With low infrastructure costs and high gross margins, VendorVigilance is designed to reach profitability quickly while maintaining aggressive growth.
          </p>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div className="bg-card rounded-xl p-8 border border-border" whileHover={{
            y: -5,
            transition: {
              duration: 0.2
            }
          }}>
              <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Low Burn Model</h3>
              <p className="text-muted-foreground mb-4">
                Infrastructure costs under $100/month. Single customer covers operating expenses 4x over.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /> Serverless architecture</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /> Pay-per-use AI costs</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /> Founder-led until $50K MRR</li>
              </ul>
            </motion.div>

            <motion.div className="bg-card rounded-xl p-8 border border-border" whileHover={{
            y: -5,
            transition: {
              duration: 0.2
            }
          }}>
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Scalable Unit Economics</h3>
              <p className="text-muted-foreground mb-4">
                Strong LTV:CAC ratio with product-led growth reducing acquisition costs over time.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /> Content + SEO flywheel</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /> Vendor network effects</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /> Self-serve onboarding</li>
              </ul>
            </motion.div>

            <motion.div className="bg-card rounded-xl p-8 border border-border" whileHover={{
            y: -5,
            transition: {
              duration: 0.2
            }
          }}>
              <div className="w-12 h-12 bg-warning/20 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Multiple Exit Paths</h3>
              <p className="text-muted-foreground mb-4">
                Strategic value for GRC platforms, compliance tools, and enterprise security vendors.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /> GRC platform acquirers</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /> Compliance automation players</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /> Enterprise security vendors</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>
      {/* Competition Section */}
      <motion.section className="py-16 md:py-20 bg-card" {...fadeInUp}>
        <div className="container mx-auto px-4 md:px-6">
          <Badge variant="outline" className="mb-4 text-primary border-primary">Competition</Badge>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-8 md:mb-12">
            A Clear Gap in the Mid-Market
          </h2>
          <motion.div className="overflow-x-auto mb-6 md:mb-8" {...scaleIn}>
            <table className="w-full border-collapse bg-secondary rounded-xl overflow-hidden min-w-[500px]">
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
                <tr className="border-b border-border bg-card/50">
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
                <tr className="border-b border-border bg-card/50">
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
          </motion.div>
          <motion.div className="grid md:grid-cols-2 gap-6" {...staggerChildren}>
            <motion.div className="bg-warning/10 border-l-4 border-warning rounded-xl p-6" {...staggerItem}>
              <h3 className="text-sm font-bold uppercase text-warning mb-2">The Gap</h3>
              <p className="text-foreground">
                No TPRM-native solution between $3,600 and $15,000/year for mid-market companies with 50-500 employees.
              </p>
            </motion.div>
            <motion.div className="gradient-primary rounded-xl p-6" {...staggerItem}>
              <h3 className="text-sm font-bold uppercase text-success mb-2">Our Advantage</h3>
              <p className="text-foreground">
                AI-native architecture built ground-up. Competitors are retrofitting AI onto legacy systems.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Roadmap Section - Redesigned */}
      <motion.section className="py-16 md:py-20" {...fadeInUp}>
        <div className="container mx-auto px-4 md:px-6">
          <Badge variant="outline" className="mb-4 text-primary border-primary">Roadmap</Badge>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">
            Path to $100K+ ARR
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-12 max-w-3xl">
            A focused roadmap to establish market presence and achieve sustainable growth in 2026.
          </p>
          
          {/* Timeline Visual */}
          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-primary via-success to-warning rounded-full" />
            
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6" {...staggerChildren}>
              {[{
              quarter: 'Q1 2026',
              title: 'Launch & Validate',
              milestone: '$5K MRR',
              items: ['Production launch', '10 design partners', 'First 5 paying customers'],
              color: 'primary',
              icon: Zap
            }, {
              quarter: 'Q2 2026',
              title: 'Growth Engine',
              milestone: '$15K MRR',
              items: ['Content marketing flywheel', 'Founder-led sales process', 'Seed round close'],
              color: 'success',
              icon: TrendingUp
            }, {
              quarter: 'Q3 2026',
              title: 'Scale Up',
              milestone: '$35K MRR',
              items: ['SSO + Enterprise features', 'First enterprise customer', 'Hire engineer #1'],
              color: 'warning',
              icon: Users
            }, {
              quarter: 'Q4 2026',
              title: 'Series A Ready',
              milestone: '$60K+ MRR',
              items: ['100+ customers', 'Integration ecosystem', 'Expand sales team'],
              color: 'success',
              icon: Target
            }].map((item, i) => <motion.div key={i} className="relative" {...staggerItem} whileHover={{
              y: -5,
              transition: {
                duration: 0.2
              }
            }}>
                  {/* Milestone dot */}
                  <div className="hidden md:flex absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-background border-4 border-primary rounded-full items-center justify-center z-10">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  
                  <Card className="bg-secondary border-border mt-4 md:mt-16 h-full">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`bg-${item.color} text-${item.color}-foreground`}>{item.quarter}</Badge>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1">{item.title}</h3>
                      <p className={`text-2xl font-extrabold text-${item.color} mb-4`}>{item.milestone}</p>
                      <ul className="space-y-2">
                        {item.items.map((li, j) => <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            {li}
                          </li>)}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>)}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Founder Section */}
      <motion.section className="py-16 md:py-20 bg-card" {...fadeInUp}>
        <div className="container mx-auto px-4 md:px-6">
          <Badge variant="outline" className="mb-4 text-primary border-primary">Founder</Badge>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-8 md:mb-12">
            Security Practitioner + Product Builder
          </h2>
          <div className="grid lg:grid-cols-3 gap-8 md:gap-12 items-center">
            <motion.div className="flex justify-center" {...scaleIn}>
              <div className="relative">
                <div className="w-56 h-56 rounded-3xl overflow-hidden border-4 border-primary/30 shadow-2xl">
                  <img src={founderHeadshot} alt="Founder headshot" className="w-full h-full object-cover object-top" />
                </div>
                <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <img src={logo} alt="VendorVigilance" className="w-full h-full object-cover" />
                </div>
              </div>
            </motion.div>
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-primary mb-2">Taylor Fletcher</h3>
                <p className="text-muted-foreground">Founder & CEO</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="py-1.5">Product Manager @ BlueVoyant (MDR & TPRM)</Badge>
                <Badge variant="secondary" className="py-1.5">Founder, Bespoke Pentesting Startup</Badge>
                <Badge variant="secondary" className="py-1.5">3+ Years Cloud & SaaS Security</Badge>
              </div>
              
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">Deep domain expertise:</span> Spent 3+ years in the trenches of cloud security, application security, vulnerability program management, and SaaS security. Currently leading product at BlueVoyant, a cybersecurity company specializing in Managed Detection & Response and Third-Party Risk Management.
                </p>
                <p>
                  <span className="font-semibold text-foreground">Founder DNA:</span> Built a boutique pentesting startup from scratch, delivering enterprise-grade security assessments at a fraction of typical costs. Proven ability to identify market gaps and build solutions that customers love.
                </p>
                <p>
                  <span className="font-semibold text-foreground">The insight:</span> Working at a TPRM leader, I see firsthand that the majority of mid-market companies are priced out of effective vendor risk solutions. They deserve enterprise-grade security without the enterprise price tag.
                </p>
              </div>

              <blockquote className="text-lg italic text-foreground border-l-4 border-primary pl-6 bg-primary/5 py-4 pr-4 rounded-r-xl">
                "I love breaking things and fixing them back better. Building products that genuinely help security teams protect their organizations is what drives me."
              </blockquote>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Why Now Section */}
      <motion.section className="py-16 md:py-20 bg-gradient-to-br from-amber-500/10 via-background to-orange-500/10" initial={{
      opacity: 0
    }} whileInView={{
      opacity: 1
    }} viewport={{
      once: true
    }} transition={{
      duration: 0.8
    }}>
        <div className="container mx-auto px-4 md:px-6">
          <motion.div className="text-center mb-10 md:mb-16" initial={{
          y: 20,
          opacity: 0
        }} whileInView={{
          y: 0,
          opacity: 1
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.2
        }}>
            <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">Market Timing</Badge>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground">Why Now?</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[{
            icon: '📈',
            title: 'Regulatory Tsunami',
            desc: 'SEC cybersecurity disclosure rules (Dec 2023) and DORA (Jan 2025) are forcing companies to prove vendor oversight—or face fines.'
          }, {
            icon: '💸',
            title: 'SMB Budget Squeeze',
            desc: 'Enterprise tools cost $50K+/year. The 28M SMBs in the US have zero affordable options for compliance-grade vendor management.'
          }, {
            icon: '🤖',
            title: 'AI Inflection Point',
            desc: 'LLMs can now analyze questionnaires, extract risks, and generate reports—work that used to require expensive analysts.'
          }, {
            icon: '⚠️',
            title: 'Supply Chain Attacks Surge',
            desc: 'SolarWinds, MOVEit, 3CX—third-party breaches are up 78% YoY. Boards are demanding visibility into vendor security.'
          }].map((item, i) => <motion.div key={i} initial={{
            y: 30,
            opacity: 0
          }} whileInView={{
            y: 0,
            opacity: 1
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.1 * i
          }}>
                <Card className="h-full bg-card/50 border-border/50 hover:border-amber-500/50 transition-all duration-300">
                  <CardContent className="p-4 md:p-6">
                    <div className="text-3xl md:text-4xl mb-3 md:mb-4">{item.icon}</div>
                    <h3 className="text-base md:text-lg font-semibold text-foreground mb-2 md:mb-3">{item.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>)}
          </div>

          <motion.div className="mt-12 text-center" initial={{
          y: 20,
          opacity: 0
        }} whileInView={{
          y: 0,
          opacity: 1
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.5
        }}>
            
          </motion.div>
        </div>
      </motion.section>

      {/* Appendix - Financial Projections & Unit Economics */}
      <motion.section className="py-16 md:py-20 bg-card" {...fadeInUp}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-5 h-5 text-primary" />
            <Badge variant="outline" className="text-primary border-primary">Appendix</Badge>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
            Financial Projections & Unit Economics
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-12 max-w-3xl">
            Comprehensive 3-year financial forecast with detailed unit economics and sensitivity analysis.
          </p>

          {/* 3-Year Financial Forecast */}
          <motion.div className="mb-10 md:mb-14" {...scaleIn}>
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              3-Year Financial Forecast
            </h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse bg-secondary rounded-xl overflow-hidden min-w-[600px]">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="p-3 md:p-4 text-left font-semibold text-sm md:text-base">Metric</th>
                    <th className="p-3 md:p-4 text-center font-semibold text-sm md:text-base">2026</th>
                    <th className="p-3 md:p-4 text-center font-semibold text-sm md:text-base">2027</th>
                    <th className="p-3 md:p-4 text-center font-semibold text-sm md:text-base">2028</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3 md:p-4 text-foreground font-medium text-sm md:text-base">Annual Revenue (ARR)</td>
                    <td className="p-3 md:p-4 text-center text-success font-semibold text-sm md:text-base">$720K</td>
                    <td className="p-3 md:p-4 text-center text-success font-semibold text-sm md:text-base">$2.4M</td>
                    <td className="p-3 md:p-4 text-center text-success font-semibold text-sm md:text-base">$6.0M</td>
                  </tr>
                  <tr className="border-b border-border bg-card/50">
                    <td className="p-3 md:p-4 text-foreground font-medium text-sm md:text-base">Ending MRR</td>
                    <td className="p-3 md:p-4 text-center text-muted-foreground text-sm md:text-base">$60K</td>
                    <td className="p-3 md:p-4 text-center text-muted-foreground text-sm md:text-base">$200K</td>
                    <td className="p-3 md:p-4 text-center text-muted-foreground text-sm md:text-base">$500K</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 md:p-4 text-foreground font-medium text-sm md:text-base">Customers (EOY)</td>
                    <td className="p-3 md:p-4 text-center text-muted-foreground text-sm md:text-base">130</td>
                    <td className="p-3 md:p-4 text-center text-muted-foreground text-sm md:text-base">400</td>
                    <td className="p-3 md:p-4 text-center text-muted-foreground text-sm md:text-base">950</td>
                  </tr>
                  <tr className="border-b border-border bg-card/50">
                    <td className="p-3 md:p-4 text-foreground font-medium text-sm md:text-base">COGS (AI + Infra)</td>
                    <td className="p-3 md:p-4 text-center text-destructive text-sm md:text-base">$108K</td>
                    <td className="p-3 md:p-4 text-center text-destructive text-sm md:text-base">$360K</td>
                    <td className="p-3 md:p-4 text-center text-destructive text-sm md:text-base">$900K</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 md:p-4 text-foreground font-medium text-sm md:text-base">Gross Profit</td>
                    <td className="p-3 md:p-4 text-center text-success text-sm md:text-base">$612K (85%)</td>
                    <td className="p-3 md:p-4 text-center text-success text-sm md:text-base">$2.04M (85%)</td>
                    <td className="p-3 md:p-4 text-center text-success text-sm md:text-base">$5.1M (85%)</td>
                  </tr>
                  <tr className="border-b border-border bg-card/50">
                    <td className="p-3 md:p-4 text-foreground font-medium text-sm md:text-base">Operating Expenses</td>
                    <td className="p-3 md:p-4 text-center text-destructive text-sm md:text-base">$580K</td>
                    <td className="p-3 md:p-4 text-center text-destructive text-sm md:text-base">$1.8M</td>
                    <td className="p-3 md:p-4 text-center text-destructive text-sm md:text-base">$3.5M</td>
                  </tr>
                  <tr className="bg-success/20">
                    <td className="p-3 md:p-4 text-foreground font-bold text-sm md:text-base">Net Income</td>
                    <td className="p-3 md:p-4 text-center text-destructive font-bold text-sm md:text-base">($68K)</td>
                    <td className="p-3 md:p-4 text-center text-success font-bold text-sm md:text-base">$240K</td>
                    <td className="p-3 md:p-4 text-center text-success font-bold text-sm md:text-base">$1.6M</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Expense Breakdown & Runway */}
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-secondary rounded-xl p-4 md:p-6 border border-border">
                <h4 className="text-sm md:text-base font-semibold text-foreground mb-3">2026 OpEx Breakdown</h4>
                <div className="space-y-2">
                  {[{
                  label: 'Engineering (2 FTEs)',
                  amount: '$280K',
                  percent: 48
                }, {
                  label: 'Sales & Marketing',
                  amount: '$180K',
                  percent: 31
                }, {
                  label: 'G&A (Legal, Accounting)',
                  amount: '$60K',
                  percent: 10
                }, {
                  label: 'Tools & Software',
                  amount: '$40K',
                  percent: 7
                }].map((item, i) => <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="text-foreground font-medium">{item.amount}</span>
                      </div>
                      <div className="w-full bg-card rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{
                      width: `${item.percent}%`
                    }} />
                      </div>
                    </div>)}
                </div>
              </div>

              <div className="bg-secondary rounded-xl p-4 md:p-6 border border-border">
                <h4 className="text-sm md:text-base font-semibold text-foreground mb-3">Runway & Funding</h4>
                <div className="space-y-3">
                  <div className="bg-warning/10 rounded-lg p-3">
                    <p className="text-xs text-warning font-semibold uppercase mb-1">Seed Round Target</p>
                    <p className="text-xl font-extrabold text-warning">$750K</p>
                    <p className="text-xs text-muted-foreground">18-month runway to profitability</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-success/10 rounded-lg p-2 text-center">
                      <p className="text-xs text-success font-semibold uppercase">Break-Even</p>
                      <p className="text-lg font-bold text-success">Q2 2027</p>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-2 text-center">
                      <p className="text-xs text-primary font-semibold uppercase">Cash Flow +</p>
                      <p className="text-lg font-bold text-primary">Q3 2027</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Unit Economics Calculations */}
          <motion.div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12" {...staggerChildren}>
            <motion.div className="bg-secondary rounded-xl p-4 md:p-6 border border-border" {...staggerItem}>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-success" />
                LTV Calculation
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-2 bg-card rounded-lg">
                  <span className="text-muted-foreground">Average Revenue Per Account (ARPA)</span>
                  <span className="font-mono font-semibold text-foreground">$450/mo</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-card rounded-lg">
                  <span className="text-muted-foreground">Gross Margin</span>
                  <span className="font-mono font-semibold text-foreground">85%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-card rounded-lg">
                  <span className="text-muted-foreground">Monthly Churn Rate</span>
                  <span className="font-mono font-semibold text-foreground">2.5%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-card rounded-lg">
                  <span className="text-muted-foreground">Customer Lifetime (1/churn)</span>
                  <span className="font-mono font-semibold text-foreground">40 months</span>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                    <span className="font-medium text-foreground">LTV = ARPA × GM × Lifetime</span>
                    <span className="font-mono font-bold text-success text-lg">$15,300</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="bg-secondary rounded-xl p-4 md:p-6 border border-border" {...staggerItem}>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                CAC Calculation
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-2 bg-card rounded-lg">
                  <span className="text-muted-foreground">Content Marketing (annual)</span>
                  <span className="font-mono font-semibold text-foreground">$24,000</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-card rounded-lg">
                  <span className="text-muted-foreground">Paid Ads (annual)</span>
                  <span className="font-mono font-semibold text-foreground">$36,000</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-card rounded-lg">
                  <span className="text-muted-foreground">Sales Tools & Ops</span>
                  <span className="font-mono font-semibold text-foreground">$12,000</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-card rounded-lg">
                  <span className="text-muted-foreground">New Customers (Year 1)</span>
                  <span className="font-mono font-semibold text-foreground">130</span>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                    <span className="font-medium text-foreground">CAC = Total S&M ÷ New Customers</span>
                    <span className="font-mono font-bold text-primary text-lg">$554</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Key Ratios */}
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12" {...staggerChildren}>
            {[{
            label: 'LTV:CAC Ratio',
            value: '27.6x',
            target: 'Target: >3x',
            status: 'success'
          }, {
            label: 'CAC Payback',
            value: '1.4 mo',
            target: 'Target: <12mo',
            status: 'success'
          }, {
            label: 'Magic Number',
            value: '1.8',
            target: 'Target: >0.75',
            status: 'success'
          }, {
            label: 'Rule of 40',
            value: '95%',
            target: 'Growth + Margin',
            status: 'success'
          }].map((item, i) => <motion.div key={i} className={`bg-${item.status}/10 rounded-xl p-3 md:p-4 text-center border border-${item.status}/20`} {...staggerItem}>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">{item.label}</p>
                <p className={`text-xl md:text-3xl font-bold text-${item.status}`}>{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.target}</p>
              </motion.div>)}
          </motion.div>

          {/* Sensitivity Analysis */}
          <motion.div className="bg-secondary rounded-xl p-4 md:p-6 border border-border" {...scaleIn}>
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-warning" />
              Sensitivity Analysis: 2027 ARR by Growth Scenario
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-left font-semibold text-muted-foreground text-sm">Scenario</th>
                    <th className="p-3 text-center font-semibold text-muted-foreground text-sm">Monthly Growth</th>
                    <th className="p-3 text-center font-semibold text-muted-foreground text-sm">2027 Customers</th>
                    <th className="p-3 text-center font-semibold text-muted-foreground text-sm">2027 ARR</th>
                    <th className="p-3 text-center font-semibold text-muted-foreground text-sm">Burn Multiple</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="p-3 text-foreground font-medium text-sm">Conservative</td>
                    <td className="p-3 text-center text-muted-foreground text-sm">8%</td>
                    <td className="p-3 text-center text-muted-foreground text-sm">280</td>
                    <td className="p-3 text-center text-warning font-semibold text-sm">$1.5M</td>
                    <td className="p-3 text-center text-muted-foreground text-sm">0.8x</td>
                  </tr>
                  <tr className="border-b border-border/50 bg-success/5">
                    <td className="p-3 text-foreground font-medium text-sm flex items-center gap-2">
                      Base Case
                      <Badge className="bg-success/20 text-success border-0 text-xs">Plan</Badge>
                    </td>
                    <td className="p-3 text-center text-muted-foreground text-sm">12%</td>
                    <td className="p-3 text-center text-muted-foreground text-sm">400</td>
                    <td className="p-3 text-center text-success font-bold text-sm">$2.4M</td>
                    <td className="p-3 text-center text-muted-foreground text-sm">0.5x</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3 text-foreground font-medium text-sm">Aggressive</td>
                    <td className="p-3 text-center text-muted-foreground text-sm">15%</td>
                    <td className="p-3 text-center text-muted-foreground text-sm">550</td>
                    <td className="p-3 text-center text-primary font-semibold text-sm">$3.3M</td>
                    <td className="p-3 text-center text-muted-foreground text-sm">0.4x</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-foreground font-medium text-sm">Hypergrowth</td>
                    <td className="p-3 text-center text-muted-foreground text-sm">20%</td>
                    <td className="p-3 text-center text-muted-foreground text-sm">750</td>
                    <td className="p-3 text-center text-primary font-bold text-sm">$4.5M</td>
                    <td className="p-3 text-center text-muted-foreground text-sm">0.3x</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              * Burn Multiple = Net Burn ÷ Net New ARR. Lower is better. &lt;1x is efficient growth.
            </p>
          </motion.div>

          {/* Key Assumptions */}
          <motion.div className="mt-6 md:mt-8 p-4 bg-warning/5 border border-warning/20 rounded-xl" {...staggerItem}>
            <h4 className="text-sm font-semibold text-warning mb-2">Sensitivity Assumptions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
              <div>• Churn held constant at 2.5%</div>
              <div>• ARPA grows 5% annually</div>
              <div>• CAC decreases with scale</div>
              <div>• Gross margin stable at 85%</div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section className="py-16 md:py-20 gradient-primary relative overflow-hidden" initial={{
      opacity: 0
    }} whileInView={{
      opacity: 1
    }} viewport={{
      once: true
    }} transition={{
      duration: 0.8
    }}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <motion.h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4" initial={{
          y: 20,
          opacity: 0
        }} whileInView={{
          y: 0,
          opacity: 1
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.2
        }}>
            Strategic Partners, Not Just Capital
          </motion.h2>
          <motion.p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-12" initial={{
          y: 20,
          opacity: 0
        }} whileInView={{
          y: 0,
          opacity: 1
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.3
        }}>I am looking for investors and partners who understand security and can open doors</motion.p>
          <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12" initial={{
          y: 20,
          opacity: 0
        }} whileInView={{
          y: 0,
          opacity: 1
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.4
        }}>
            {[{
            title: 'Design Partners',
            desc: 'Introductions to 3-5 security teams from your LP network'
          }, {
            title: 'Market Feedback',
            desc: 'Insights on positioning and pricing from investors who know security buyers'
          }, {
            title: 'Seed Investment',
            desc: '$500K-$1M when we hit $5-10K MRR'
          }].map((item, i) => <motion.div key={i} className="bg-white/10 border border-white/20 rounded-xl p-4 md:p-6 backdrop-blur-sm" whileHover={{
            scale: 1.03,
            transition: {
              duration: 0.2
            }
          }}>
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>)}
          </motion.div>
          <motion.div initial={{
          y: 20,
          opacity: 0
        }} whileInView={{
          y: 0,
          opacity: 1
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.5
        }}>
            <p className="text-2xl font-semibold text-foreground mb-2">I'm a hacker and a hustler.  Ready to break, and ready to build.</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <a href="mailto:taylor@wolfpacksecurity.org" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors bg-white/10 px-4 py-2 rounded-lg">
                <span>📧</span>
                taylor@wolfpacksecurity.org
              </a>
              <a href="https://www.linkedin.com/in/tayfletch/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors bg-white/10 px-4 py-2 rounded-lg">
                <span>💼</span>
                LinkedIn
              </a>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>;
}