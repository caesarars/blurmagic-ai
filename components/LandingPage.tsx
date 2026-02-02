
import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [email, setEmail] = useState('');
  const [showWaitlistSuccess, setShowWaitlistSuccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setShowWaitlistSuccess(true);
      setEmail('');
      setTimeout(() => setShowWaitlistSuccess(false), 3000);
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: '🤖',
      title: 'AI Smart Detection',
      desc: 'Automatically detect faces, text, and sensitive areas with Gemini AI. No manual selection needed.'
    },
    {
      icon: '⚡',
      title: 'One-Click Blur',
      desc: 'Apply professional-grade blur effects in seconds. Gaussian, pixelate, or custom patterns.'
    },
    {
      icon: '🔒',
      title: 'Privacy First',
      desc: 'Client-side processing for manual edits. Metadata wiping included. Your images never stored.'
    },
    {
      icon: '📱',
      title: 'Platform Ready',
      desc: 'Built-in compliance presets for Instagram, Twitter, OnlyFans. Stay within platform guidelines.'
    },
    {
      icon: '⚙️',
      title: 'Batch Processing',
      desc: 'Process hundreds of images at once. Perfect for content creators and agencies.'
    },
    {
      icon: '🎯',
      title: 'Precision Control',
      desc: 'Adjustable intensity, focus radius, and watermark positioning. Full creative control.'
    }
  ];

  const presets = [
    { name: 'Social Compliance', desc: 'Twitter/Instagram safe (20px pixel)', icon: '📱' },
    { name: 'Member Teaser', desc: 'Curiosity-inducing Gaussian blur', icon: '💎' },
    { name: 'Face Anonymize', desc: 'AI-powered face detection & blur', icon: '😶' },
    { name: 'Location Hide', desc: 'Background blur for privacy', icon: '🛡️' },
  ];

  const pricing = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['5 images/day', 'Manual blur only', 'Basic watermark', 'Community support'],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: '/month',
      features: ['Unlimited images', 'All AI features', 'No watermark', 'HD export (4K)', 'Priority support', 'Batch processing'],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Team',
      price: '$29.99',
      period: '/month',
      features: ['Everything in Pro', '5 team members', 'API access', 'Custom presets', 'Dedicated support', 'White-label option'],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Content Creator',
      content: 'Saved me hours of editing. The AI detection is scary accurate!',
      avatar: '👩‍💼'
    },
    {
      name: 'James K.',
      role: 'Privacy Advocate',
      content: 'Finally a tool that respects privacy. Client-side processing is a game changer.',
      avatar: '👨‍💻'
    },
    {
      name: 'Emily R.',
      role: 'Social Media Manager',
      content: 'Batch processing 100+ images in minutes. Worth every penny.',
      avatar: '👩‍🎨'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-950/90 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-lg shadow-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">BlurMagic AI</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-sm text-slate-400 hover:text-white transition-colors">Features</button>
              <button onClick={() => scrollToSection('presets')} className="text-sm text-slate-400 hover:text-white transition-colors">Presets</button>
              <button onClick={() => scrollToSection('pricing')} className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</button>
              <button onClick={onEnterApp} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all">
                Launch App
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-blue-400 font-medium">Now with Gemini AI Integration</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
                Blur Photos in Seconds,
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Not Minutes
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              AI-powered image blurring for content creators, privacy advocates, and social media managers. 
              One-click compliance, zero technical skills needed.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button 
                onClick={onEnterApp}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95"
              >
                Try Free — No Signup Required
              </button>
              <button 
                onClick={() => scrollToSection('demo')}
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Watch Demo
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-white font-medium">5 free images daily</span>
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Logos */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500 mb-8 uppercase tracking-widest">Trusted by creators from</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50">
            <span className="text-xl font-bold text-slate-400">OnlyFans</span>
            <span className="text-xl font-bold text-slate-400">Patreon</span>
            <span className="text-xl font-bold text-slate-400">Fanvue</span>
            <span className="text-xl font-bold text-slate-400">Instagram</span>
            <span className="text-xl font-bold text-slate-400">Twitter</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Professional-grade blurring tools powered by cutting-edge AI. 
              Designed for speed, privacy, and ease of use.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Presets Section */}
      <section id="presets" className="py-24 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Platform-Specific Presets</h2>
              <p className="text-slate-400 text-lg mb-8">
                One-click compliance for every major platform. No more guessing what works — 
                we've tuned each preset to meet platform guidelines while keeping your content engaging.
              </p>
              
              <div className="space-y-4">
                {presets.map((preset, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-2xl">{preset.icon}</span>
                    <div>
                      <h4 className="font-semibold">{preset.name}</h4>
                      <p className="text-sm text-slate-400">{preset.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-slate-400">Interactive Demo</p>
                  <button onClick={onEnterApp} className="mt-4 text-blue-400 hover:text-blue-300 font-medium">
                    Try it now →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo/Interactive Section */}
      <section id="demo" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">See It in Action</h2>
            <p className="text-slate-400 text-lg">Drag the slider to compare before and after</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-slate-500">Interactive Before/After Demo</p>
              </div>
            </div>
            <p className="text-center text-sm text-slate-500 mt-4">
              Try the full experience in the app →
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 text-lg">Start free, upgrade when you need more power</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, idx) => (
              <div 
                key={idx} 
                className={`relative p-8 rounded-2xl ${plan.popular ? 'bg-gradient-to-b from-blue-600/20 to-slate-900 border-2 border-blue-500' : 'bg-white/5 border border-white/10'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 rounded-full text-xs font-bold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-3 text-sm">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={onEnterApp}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.popular ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Creators</h2>
            <p className="text-slate-400 text-lg">See what our users are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-slate-300">"{testimonial.content}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-blue-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Save Hours?</h2>
          <p className="text-xl text-slate-400 mb-10">
            Join thousands of creators who've switched to AI-powered blurring. 
            Start free, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onEnterApp}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all shadow-lg shadow-blue-500/25"
            >
              Start Blurring Free
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-6">
            Free forever plan available. Upgrade anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-bold">BlurMagic AI</span>
              </div>
              <p className="text-sm text-slate-400">
                AI-powered image blurring for creators who value privacy and efficiency.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={onEnterApp} className="hover:text-white transition-colors">Launch App</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-sm text-slate-500">
            © 2025 BlurMagic AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
