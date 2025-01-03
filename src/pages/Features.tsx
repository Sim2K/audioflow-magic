import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Wand2, Brain, Rocket, Clock, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Mic,
    title: "Voice Recording and Processing",
    description: "High-quality audio capture with advanced noise reduction and enhancement capabilities",
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Real-time speech recognition and intelligent content analysis using cutting-edge AI models",
  },
  {
    icon: Wand2,
    title: "Smart Transcription",
    description: "Accurate speech-to-text conversion with automatic punctuation and speaker detection",
  },
  {
    icon: Share2,
    title: "Seamless Integration",
    description: "Export transcripts in multiple formats and integrate with your favorite tools",
  },
  {
    icon: Clock,
    title: "Real-Time Processing",
    description: "Process audio in real-time with minimal latency for immediate results",
  },
  {
    icon: Rocket,
    title: "Advanced Workflows",
    description: "Create custom workflows to automate your audio processing tasks",
  },
];

const stats = [
  { value: "99.9%", label: "Accuracy Rate" },
  { value: "50+", label: "Supported Languages" },
  { value: "<2s", label: "Processing Latency" },
  { value: "24/7", label: "Availability" },
];

const benefits = [
  {
    title: "Enhanced Productivity",
    description: "Save hours of manual transcription work with our AI-powered solution",
    points: [
      "Automatic speech recognition",
      "Real-time transcription",
      "Custom vocabulary support",
    ],
  },
  {
    title: "Professional Quality",
    description: "Get broadcast-quality audio processing and precise transcriptions",
    points: [
      "Advanced noise reduction",
      "Speaker diarization",
      "Automatic formatting",
    ],
  },
  {
    title: "Flexible Workflows",
    description: "Create custom flows that match your exact needs",
    points: [
      "Customizable pipelines",
      "Multiple export formats",
      "API integration options",
    ],
  },
];

const plans = [
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    description: "Perfect for individual creators and small projects",
    features: [
      "Up to 5 hours of audio per month",
      "Basic audio processing",
      "Standard transcription",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: "$29",
    period: "/month",
    description: "Ideal for professionals and growing teams",
    features: [
      "Up to 20 hours of audio per month",
      "Advanced audio processing",
      "Priority transcription",
      "Custom vocabulary",
      "24/7 support",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations with high-volume needs",
    features: [
      "Unlimited audio processing",
      "Custom AI model training",
      "API access",
      "Dedicated support",
      "SLA guarantee",
    ],
  },
];

export default function Features() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16 space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
          Transform Your Audio Workflow
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Harness the power of AI to revolutionize your audio processing and transcription needs
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/flows">Try Demo</Link>
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </section>

      {/* Features Grid */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-center">
          Powerful Features for Every Need
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/10 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-center">
          Why Choose AI Audio Flow
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
              <ul className="space-y-2">
                {benefit.points.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-center">
          Plans That Scale With You
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-6 space-y-6 ${
                plan.highlighted
                  ? "border-purple-600 border-2"
                  : ""
              }`}
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                Get Started
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 bg-purple-600 text-white rounded-3xl p-12">
        <h2 className="text-3xl font-bold">
          Start Transforming Your Audio Today
        </h2>
        <p className="text-purple-100 max-w-2xl mx-auto">
          Join thousands of creators and businesses who trust AI Audio Flow for their audio processing needs
        </p>
        <Button size="lg" variant="secondary" asChild>
          <Link to="/flows">Get Started Now</Link>
        </Button>
      </section>
    </div>
  );
}
