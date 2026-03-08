import { Link } from "react-router-dom";
import { ArrowRight, Bed, Car, PartyPopper } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import accommodationImg from "@/assets/accommodation-1.jpg";
import ridesImg from "@/assets/rides-1.jpg";
import eventHallImg from "@/assets/event-hall-1.jpg";

export const ServiceCategories = () => {
  const { t } = useLanguage();

  const services = [
    {
      id: "accommodation",
      title: t("accommodation"),
      description: t("accommodation_desc"),
      icon: Bed,
      image: accommodationImg,
      href: "/accommodation",
      stats: { count: "2,500+", label: t("properties") },
      color: "from-primary to-primary/80",
    },
    {
      id: "rides",
      title: t("rides_transport"),
      description: t("rides_desc"),
      icon: Car,
      image: ridesImg,
      href: "/rides",
      stats: { count: "850+", label: t("vehicles") },
      color: "from-accent to-accent/80",
    },
    {
      id: "events",
      title: t("event_halls_title"),
      description: t("event_halls_desc"),
      icon: PartyPopper,
      image: eventHallImg,
      href: "/events",
      stats: { count: "320+", label: t("venues") },
      color: "from-success to-success/80",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            {t("what_looking_for")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("services_subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <Link
              key={service.id}
              to={service.href}
              className="group relative bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <span className="text-lg font-bold text-foreground">{service.stats.count}</span>
                  <span className="text-xs text-muted-foreground ml-1">{service.stats.label}</span>
                </div>
                <div className={`absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg`}>
                  <service.icon className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {service.description}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                  {t("explore")} <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
