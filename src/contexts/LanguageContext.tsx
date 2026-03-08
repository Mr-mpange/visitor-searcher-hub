import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/components/booking/LanguageSelector";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    home: "Home",
    accommodation: "Accommodation",
    rides: "Rides",
    event_halls: "Event Halls",
    how_it_works: "How It Works",
    for_providers: "For Providers",
    login: "Login",
    sign_up: "Sign Up",
    my_profile: "My Profile",
    favorites: "Favorites",
    my_bookings: "My Bookings",
  },
  sw: {
    home: "Nyumbani",
    accommodation: "Malazi",
    rides: "Usafiri",
    event_halls: "Kumbi za Hafla",
    how_it_works: "Jinsi Inavyofanya Kazi",
    for_providers: "Kwa Watoa Huduma",
    login: "Ingia",
    sign_up: "Jisajili",
    my_profile: "Wasifu Wangu",
    favorites: "Vipendwa",
    my_bookings: "Uhifadhi Wangu",
  },
  fr: {
    home: "Accueil",
    accommodation: "Hébergement",
    rides: "Trajets",
    event_halls: "Salles d'événements",
    how_it_works: "Comment ça marche",
    for_providers: "Pour les prestataires",
    login: "Connexion",
    sign_up: "S'inscrire",
    my_profile: "Mon Profil",
    favorites: "Favoris",
    my_bookings: "Mes Réservations",
  },
  ar: {
    home: "الرئيسية",
    accommodation: "الإقامة",
    rides: "الرحلات",
    event_halls: "قاعات المناسبات",
    how_it_works: "كيف يعمل",
    for_providers: "لمقدمي الخدمات",
    login: "تسجيل الدخول",
    sign_up: "إنشاء حساب",
    my_profile: "ملفي الشخصي",
    favorites: "المفضلة",
    my_bookings: "حجوزاتي",
  },
  pt: {
    home: "Início",
    accommodation: "Alojamento",
    rides: "Viagens",
    event_halls: "Salões de Eventos",
    how_it_works: "Como Funciona",
    for_providers: "Para Fornecedores",
    login: "Entrar",
    sign_up: "Registar",
    my_profile: "Meu Perfil",
    favorites: "Favoritos",
    my_bookings: "Minhas Reservas",
  },
  so: {
    home: "Bogga Hore",
    accommodation: "Hoyga",
    rides: "Raacidda",
    event_halls: "Qolalka Xafladaha",
    how_it_works: "Sida ay u Shaqayso",
    for_providers: "Bixiyeyaasha",
    login: "Soo Gal",
    sign_up: "Is Diiwaan Geli",
    my_profile: "Xogtayda",
    favorites: "Kuwa aan jeclahay",
    my_bookings: "Dalabkayga",
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const stored = localStorage.getItem("app_language");
    return (stored as LanguageCode) || "en";
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
