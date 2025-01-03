import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, GitBranch, FileText, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 to-purple-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left text-white">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Transform Your Audio
                <br />
                <span className="text-purple-200">into Actionable Insights</span>
              </h1>
              <p className="text-lg sm:text-xl text-purple-100 mb-8">
                Powerful AI-driven audio processing and analysis platform. Record, transcribe,
                and extract meaningful insights from your audio content.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to="/record">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/features">
                  <Button size="lg" variant="outline" className="bg-purple-600/20 text-white border-white hover:bg-purple-600/30">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="w-full h-[400px] bg-white/10 backdrop-blur-lg rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-700/20" />
                <div className="relative z-10">
                  <div className="flex items-center justify-center h-full">
                    <Mic className="w-24 h-24 text-white opacity-75" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Experience that grows with your needs
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features to help you manage and analyze your audio content
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Mic,
                title: "Smart Recording",
                description: "High-quality audio recording with noise reduction and enhancement",
              },
              {
                icon: GitBranch,
                title: "Custom Flows",
                description: "Create custom processing flows for your specific needs",
              },
              {
                icon: FileText,
                title: "Accurate Transcription",
                description: "Convert speech to text with high accuracy and multiple language support",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-16">
            Trusted by innovative teams worldwide
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { value: "10k+", label: "Active Users" },
              { value: "1M+", label: "Minutes Processed" },
              { value: "99%", label: "Accuracy Rate" },
            ].map((stat, index) => (
              <div key={index} className="p-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-purple-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">
            Ready to transform your audio processing?
          </h2>
          <p className="text-lg text-purple-200 mb-8">
            Start processing your audio content with AI-powered insights today.
          </p>
          <Link to="/record">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
              Get Started Now
              <Zap className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">AI Audio Flow</h3>
              <p className="text-sm">
                Transform your audio content with powerful AI processing
              </p>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/record" className="hover:text-white transition-colors">
                    Record
                  </Link>
                </li>
                <li>
                  <Link to="/flows" className="hover:text-white transition-colors">
                    Flows
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-sm text-center">
            &copy; {new Date().getFullYear()} AI Audio Flow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
