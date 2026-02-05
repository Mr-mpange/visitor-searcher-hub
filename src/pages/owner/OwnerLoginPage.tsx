import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Mail, Lock, Eye, EyeOff, ArrowLeft, Building } from "lucide-react";

const OwnerLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle owner login - will be connected to backend
    console.log("Owner login attempt:", { email, password });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">
              Safari<span className="text-primary">Stay</span>
            </span>
          </Link>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
            <Building className="w-4 h-4" />
            Provider Portal
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-2">
              Provider Sign In
            </h1>
            <p className="text-muted-foreground">
              Manage your listings, bookings, and grow your business.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="provider@example.com"
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Link to="/owner/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 pl-10 pr-12 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" size="lg" className="w-full">
              Sign In
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Want to become a provider?{" "}
            <Link to="/owner/signup" className="font-medium text-primary hover:underline">
              Register your business
            </Link>
          </p>

          {/* Traveler Login */}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Looking to book?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Traveler login
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image (Hidden on Mobile) */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-ocean relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-primary-foreground">
          <h2 className="text-4xl font-display font-bold mb-4 text-center">
            Grow Your Business
          </h2>
          <p className="text-lg text-primary-foreground/80 text-center max-w-md mb-8">
            Access your dashboard to manage listings, view bookings, and connect with travelers from around the world.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { stat: "2,500+", label: "Active Listings" },
              { stat: "50,000+", label: "Monthly Bookings" },
              { stat: "15+", label: "African Countries" },
              { stat: "98%", label: "Satisfaction Rate" },
            ].map((item) => (
              <div key={item.label} className="bg-primary-foreground/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold">{item.stat}</div>
                <div className="text-sm text-primary-foreground/70">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerLoginPage;
