import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError("Could not sign in as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen leather-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 metal-panel rounded-full mb-4">
            <div className="w-12 h-12 md:w-16 md:h-16 brass-accent rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-wood-dark" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-amber-100 font-bold tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
            SupportDesk AI
          </h1>
          <p className="text-amber-200/60 mt-2 text-sm md:text-base">Autonomous Customer Support Platform</p>
        </div>

        {/* Auth Card */}
        <div className="leather-card p-6 md:p-8">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setFlow("signIn")}
              className={`tab-button flex-1 ${flow === "signIn" ? "active" : ""}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setFlow("signUp")}
              className={`tab-button flex-1 ${flow === "signUp" ? "active" : ""}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-amber-100/80 text-sm mb-2 font-medium">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="agent@company.com"
                required
                className="inset-input w-full text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-amber-100/80 text-sm mb-2 font-medium">Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="inset-input w-full text-sm md:text-base"
              />
            </div>

            <input name="flow" type="hidden" value={flow} />

            {error && (
              <div className="p-3 rounded-lg bg-red-900/30 border border-red-700/50 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="brass-btn w-full flex items-center justify-center gap-2 text-sm md:text-base"
            >
              {isLoading ? (
                <>
                  <div className="loading-dial w-5 h-5">
                    <div className="dial-spinner" style={{ height: '8px', top: '4px' }}></div>
                  </div>
                  Processing...
                </>
              ) : (
                flow === "signIn" ? "Access Dashboard" : "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-wood-dark/30">
            <button
              type="button"
              onClick={handleAnonymous}
              disabled={isLoading}
              className="embossed-btn w-full text-sm md:text-base"
            >
              Continue as Guest
            </button>
          </div>

          {/* Decorative elements */}
          <div className="flex justify-center gap-4 mt-6">
            <div className="led led-green"></div>
            <div className="led led-amber"></div>
            <div className="led led-red"></div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center footer-text">
          Requested by @web-user · Built by @clonkbot
        </footer>
      </div>
    </div>
  );
}
