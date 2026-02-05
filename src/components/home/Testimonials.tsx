import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    name: "Amara Okonkwo",
    role: "Travel Blogger",
    location: "Lagos, Nigeria",
    avatar: "AO",
    rating: 5,
    text: "SafariStay transformed my trip to Kenya! The booking process was seamless, and the accommodation exceeded all expectations. The USSD feature is a game-changer for travelers without constant internet access.",
  },
  {
    id: 2,
    name: "Jean-Pierre Mukasa",
    role: "Business Executive",
    location: "Kigali, Rwanda",
    avatar: "JM",
    rating: 5,
    text: "I've used SafariStay for multiple business trips across East Africa. The event halls are top-notch, and the customer service team is incredibly responsive. Highly recommended!",
  },
  {
    id: 3,
    name: "Sarah Ndegwa",
    role: "Wedding Planner",
    location: "Nairobi, Kenya",
    avatar: "SN",
    rating: 5,
    text: "As a wedding planner, finding the perfect venue is crucial. SafariStay's extensive catalog and detailed listings have made my job so much easier. My clients love the options!",
  },
  {
    id: 4,
    name: "David Mensah",
    role: "Safari Guide",
    location: "Accra, Ghana",
    avatar: "DM",
    rating: 5,
    text: "The ride booking system is fantastic! My clients can easily arrange safari vehicles and airport transfers. The platform understands what African travelers need.",
  },
];

export const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            What Our Guests Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Here's what travelers across Africa have to say.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-card rounded-3xl p-8 lg:p-12 shadow-lg">
            {/* Quote Icon */}
            <div className="absolute top-6 right-8 text-primary/10">
              <Quote className="w-24 h-24" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                ))}
              </div>

              {/* Text */}
              <p className="text-lg lg:text-xl text-foreground leading-relaxed mb-8">
                "{testimonials[activeIndex].text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg">
                  {testimonials[activeIndex].avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {testimonials[activeIndex].name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[activeIndex].role} • {testimonials[activeIndex].location}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="absolute bottom-8 right-8 flex gap-2">
              <button
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === activeIndex
                    ? "bg-primary w-6"
                    : "bg-border hover:bg-muted-foreground"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
