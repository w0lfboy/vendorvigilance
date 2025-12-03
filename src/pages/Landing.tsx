import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  BarChart3, 
  FileCheck, 
  Users, 
  Zap, 
  Lock, 
  Globe, 
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  Menu,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Automated vendor risk scoring with AI-powered analysis and real-time monitoring."
    },
    {
      icon: FileCheck,
      title: "Compliance Management",
      description: "Streamlined questionnaires mapped to SOC 2, ISO 27001, GDPR, and more."
    },
    {
      icon: BarChart3,
      title: "Executive Dashboards",
      description: "Real-time visibility into your vendor ecosystem with actionable insights."
    },
    {
      icon: Users,
      title: "Vendor Portal",
      description: "Self-service portal for vendors to complete assessments and upload documents."
    },
    {
      icon: Zap,
      title: "Workflow Automation",
      description: "Automate assessments, reminders, and escalations to save time."
    },
    {
      icon: Lock,
      title: "Document Vault",
      description: "Secure storage for contracts, certifications, and compliance documents."
    }
  ];

  const benefits = [
    "Reduce vendor assessment time by 70%",
    "Centralize all vendor documentation",
    "Automate compliance questionnaires",
    "Real-time risk monitoring & alerts",
    "AI-powered risk recommendations",
    "Audit-ready reporting"
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$299",
      period: "/month",
      description: "Perfect for small teams getting started with vendor management",
      features: [
        "Up to 25 vendors",
        "Basic risk assessments",
        "Document storage (5GB)",
        "Email support",
        "Standard reports"
      ],
      highlighted: false
    },
    {
      name: "Professional",
      price: "$799",
      period: "/month",
      description: "For growing organizations with complex vendor ecosystems",
      features: [
        "Up to 100 vendors",
        "Advanced risk scoring",
        "AI-powered insights",
        "Document storage (50GB)",
        "Priority support",
        "Custom questionnaires",
        "API access"
      ],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large enterprises with advanced security requirements",
      features: [
        "Unlimited vendors",
        "Full platform access",
        "Dedicated success manager",
        "Unlimited storage",
        "SSO & advanced security",
        "Custom integrations",
        "SLA guarantee"
      ],
      highlighted: false
    }
  ];

  const testimonials = [
    {
      quote: "VendorVigilance transformed how we manage third-party risk. What used to take weeks now takes hours.",
      author: "Sarah Chen",
      role: "CISO, TechCorp Inc."
    },
    {
      quote: "The automated assessments and AI recommendations have been game-changers for our compliance team.",
      author: "Michael Rodriguez",
      role: "VP of Risk, FinanceFlow"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="text-lg sm:text-xl font-bold text-foreground">VendorVigilance</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#solutions" className="text-muted-foreground hover:text-foreground transition-colors">Solutions</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-xs sm:text-sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button size="sm" className="hidden sm:inline-flex text-xs sm:text-sm" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <a 
                href="#features" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#solutions" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Solutions
              </a>
              <a 
                href="#pricing" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 sm:mb-6 text-xs sm:text-sm">
              Trusted by 500+ enterprises worldwide
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Simplify Third-Party Risk Management
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              VendorVigilance helps security and compliance teams assess, monitor, and manage vendor risks—all in one intelligent platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Button size="lg" className="text-sm sm:text-base px-6 sm:px-8" asChild>
                <Link to="/auth">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-sm sm:text-base px-6 sm:px-8">
                Book a Demo
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-4">
              14-day free trial • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              { value: "500+", label: "Enterprise Clients" },
              { value: "50K+", label: "Vendors Assessed" },
              { value: "70%", label: "Time Saved" },
              { value: "99.9%", label: "Uptime SLA" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 px-2">
              Everything You Need for Vendor Risk Management
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              A complete platform to assess, monitor, and manage third-party risks throughout the vendor lifecycle.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 bg-card/50 hover:bg-card hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4">Solutions</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Built for Security & Compliance Teams
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Whether you're managing 10 vendors or 10,000, VendorVigilance scales with your organization and adapts to your risk framework.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button className="mt-8" size="lg" asChild>
                <Link to="/auth">
                  See It in Action
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8">
                <div className="bg-background rounded-xl shadow-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Risk Overview</span>
                    <Badge variant="secondary">Live</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-foreground">142</div>
                      <div className="text-sm text-muted-foreground">Active Vendors</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-primary">94%</div>
                      <div className="text-sm text-muted-foreground">Compliant</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-amber-500">8</div>
                      <div className="text-sm text-muted-foreground">Pending Reviews</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-destructive">3</div>
                      <div className="text-sm text-muted-foreground">High Risk</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Industry Leaders
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Choose the plan that fits your organization. All plans include a 14-day free trial.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.highlighted ? 'border-primary shadow-lg scale-105' : 'border-border/50'}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.highlighted ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/auth">
                      {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-3xl p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Transform Your Vendor Risk Management?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of organizations that trust VendorVigilance to protect their business from third-party risks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base px-8" asChild>
                <Link to="/auth">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-foreground">VendorVigilance</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The intelligent platform for third-party risk management.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 mt-12 pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} VendorVigilance. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
