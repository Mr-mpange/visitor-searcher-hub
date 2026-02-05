import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building, Shield, Headphones } from "lucide-react";

const benefits = [
  {
    icon: Building,
    title: "List Your Property",
    description: "Reach thousands of travelers across Africa",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Get paid safely and on time, every time",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our team is always here to help you succeed",
  },
];

export const CTASection = () => {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="bg-gradient-coral rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Content */}
            <div className="p-8 lg:p-12 xl:p-16">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium mb-6">
                For Service Providers
              </span>

              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-primary-foreground mb-4 leading-tight">
                Grow Your Business with SafariStay
              </h2>

              <p className="text-primary-foreground/80 text-lg mb-8 max-w-md">
                Join thousands of property owners, vehicle operators, and event venue managers already earning with us.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="heroOutline" size="xl" asChild>
                  <Link to="/owner/signup">
                    Become a Partner <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  size="xl"
                  className="bg-primary-foreground text-accent hover:bg-primary-foreground/90"
                  asChild
                >
                  <Link to="/owner/login">
                    Partner Login
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Content - Benefits */}
            <div className="bg-primary-foreground/10 backdrop-blur-sm p-8 lg:p-12 flex items-center">
              <div className="space-y-6 w-full">
                {benefits.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="flex items-start gap-4 p-4 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary-foreground mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-primary-foreground/70">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
