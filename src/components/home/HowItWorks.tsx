import { Search, Calendar, CreditCard, PartyPopper, Phone, Globe } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search & Discover",
    description: "Browse through our curated listings of accommodations, rides, and event venues.",
    color: "bg-primary",
  },
  {
    icon: Calendar,
    title: "Select & Customize",
    description: "Choose your dates, preferences, and any special requirements for your booking.",
    color: "bg-accent",
  },
  {
    icon: CreditCard,
    title: "Book & Pay",
    description: "Secure your reservation with our safe payment options including mobile money.",
    color: "bg-success",
  },
  {
    icon: PartyPopper,
    title: "Enjoy Your Stay",
    description: "Experience world-class hospitality and create unforgettable memories.",
    color: "bg-warning",
  },
];

const bookingMethods = [
  {
    icon: Globe,
    title: "Web Booking",
    description: "Book through our website anytime, anywhere with full access to all features.",
  },
  {
    icon: Phone,
    title: "USSD Booking",
    description: "Dial *384*123# from any phone - no internet required!",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Booking your perfect stay or experience has never been easier. Follow these simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border" />
              )}

              {/* Step Number */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
              </div>

              {/* Icon */}
              <div className={`w-20 h-20 rounded-2xl ${step.color} mx-auto mb-5 flex items-center justify-center shadow-lg`}>
                <step.icon className="w-9 h-9 text-primary-foreground" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Booking Methods */}
        <div className="bg-gradient-hero rounded-3xl p-8 lg:p-12 text-primary-foreground">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-1">
              <h3 className="text-2xl lg:text-3xl font-display font-bold mb-3">
                Multiple Ways to Book
              </h3>
              <p className="text-primary-foreground/80">
                Whether you're online or offline, we've got you covered with flexible booking options.
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {bookingMethods.map((method) => (
                <div
                  key={method.title}
                  className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/20"
                >
                  <method.icon className="w-10 h-10 mb-4 text-accent" />
                  <h4 className="text-lg font-semibold mb-2">{method.title}</h4>
                  <p className="text-sm text-primary-foreground/80">{method.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
