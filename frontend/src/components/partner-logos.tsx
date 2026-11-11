import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  tone?: "default" | "inverse";
};

/**
 * Official PayPal horizontal mark + wordmark in authentic #003087 / #0079C1.
 */
export function PayPalLogo({ className, tone = "default" }: LogoProps) {
  const darkBlue = tone === "inverse" ? "#FFFFFF" : "#003087";
  const lightBlue = tone === "inverse" ? "#5BC2F4" : "#0079C1";
  return (
    <svg
      role="img"
      aria-label="PayPal"
      viewBox="0 0 132 32"
      className={cn("h-7 w-auto shrink-0", className)}
      fill="none"
    >
      {/* Overlapping PayPal double-P emblem */}
      <path
        d="M9.7 4.2H18.4C22.4 4.2 24.9 6.2 24.3 10.1C23.5 15.1 20.1 17.6 15.7 17.6H13.4C12.8 17.6 12.2 18 12.1 18.6L10.7 27.2C10.6 27.6 10.2 27.9 9.8 27.9H5.6C5 27.9 4.6 27.4 4.7 26.8L8.4 5.2C8.5 4.6 9.1 4.2 9.7 4.2Z"
        fill={darkBlue}
      />
      <path
        d="M14.1 9.8H21.2C24.5 9.8 26.6 11.4 26.1 14.8C25.4 19 22.4 21.1 18.7 21.1H16.8C16.2 21.1 15.7 21.5 15.6 22.1L14.5 28.4C14.4 28.8 14.1 29.1 13.7 29.1H10.4C9.9 29.1 9.5 28.6 9.6 28.1L12.7 10.8C12.8 10.2 13.4 9.8 14.1 9.8Z"
        fill={lightBlue}
      />
      {/* PayPal clean italic geometric typography */}
      <text
        x="34"
        y="22.5"
        fontFamily="Manrope, Inter, Arial, sans-serif"
        fontWeight="800"
        fontStyle="italic"
        fontSize="19.5"
        letterSpacing="-0.5"
        fill={darkBlue}
      >
        Pay
      </text>
      <text
        x="70"
        y="22.5"
        fontFamily="Manrope, Inter, Arial, sans-serif"
        fontWeight="800"
        fontStyle="italic"
        fontSize="19.5"
        letterSpacing="-0.5"
        fill={lightBlue}
      >
        Pal
      </text>
    </svg>
  );
}

/**
 * Official Elastic cluster emblem (#00BFB3 teal, #FED10A gold, #F04E98 magenta, #0077CC cobalt, #93C90E lime) + wordmark.
 */
export function ElasticLogo({ className, tone = "default" }: LogoProps) {
  const wordmark = tone === "inverse" ? "#FFFFFF" : "#343741";
  return (
    <svg
      role="img"
      aria-label="Elastic"
      viewBox="0 0 118 32"
      className={cn("h-7 w-auto shrink-0", className)}
      fill="none"
    >
      {/* Elastic authentic faceted cluster mark */}
      <circle cx="15" cy="9" r="4.5" fill="#FED10A" />
      <circle cx="22.5" cy="12" r="3.4" fill="#00BFB3" />
      <circle cx="9.2" cy="15.5" r="3.8" fill="#F04E98" />
      <circle cx="15.8" cy="16.2" r="4.2" fill="#0077CC" />
      <circle cx="21.5" cy="21" r="3.8" fill="#93C90E" />
      <circle cx="13" cy="23.2" r="4.1" fill="#00BFB3" />
      <text
        x="34"
        y="22"
        fontFamily="Manrope, Inter, Arial, sans-serif"
        fontWeight="700"
        fontSize="20"
        letterSpacing="-0.6"
        fill={wordmark}
      >
        elastic
      </text>
    </svg>
  );
}

/**
 * Official Render geometric stepped mark + wordmark.
 */
export function RenderLogo({ className, tone = "default" }: LogoProps) {
  const fg = tone === "inverse" ? "#FFFFFF" : "#10172A";
  const accent = "#46E3B7";
  return (
    <svg
      role="img"
      aria-label="Render"
      viewBox="0 0 116 32"
      className={cn("h-7 w-auto shrink-0", className)}
      fill="none"
    >
      {/* Render geometric quarter-step square mark */}
      <rect x="4" y="6" width="20" height="20" rx="4" fill={fg} />
      <path d="M9 11H15C16.6569 11 18 12.3431 18 14C18 15.6569 16.6569 17 15 17H12V21H9V11Z" fill={accent} />
      <circle cx="16.5" cy="20.5" r="2" fill={tone === "inverse" ? "#10172A" : "#FFFFFF"} />
      <text
        x="32"
        y="22"
        fontFamily="Manrope, Inter, Arial, sans-serif"
        fontWeight="700"
        fontSize="19.5"
        letterSpacing="-0.5"
        fill={fg}
      >
        Render
      </text>
    </svg>
  );
}

/**
 * Google Gemini brand mark (solid faceted four-point spark — zero gradients) + wordmark.
 */
export function GeminiLogo({ className, tone = "default" }: LogoProps) {
  const textFill = tone === "inverse" ? "#FFFFFF" : "#141B2D";
  return (
    <svg
      role="img"
      aria-label="Google Gemini"
      viewBox="0 0 148 32"
      className={cn("h-6 w-auto shrink-0", className)}
      fill="none"
    >
      <path
        d="M15 4C15.5 10.6 19.4 14.5 26 15C19.4 15.5 15.5 19.4 15 26C14.5 19.4 10.6 15.5 4 15C10.6 14.5 14.5 10.6 15 4Z"
        fill="#4285F4"
      />
      <text
        x="32"
        y="21"
        fontFamily="Manrope, Inter, Arial, sans-serif"
        fontWeight="700"
        fontSize="16.5"
        letterSpacing="-0.3"
        fill={textFill}
      >
        Google Gemini
      </text>
    </svg>
  );
}

/**
 * Jina AI brand mark + wordmark in official teal (#009191).
 */
export function JinaAiLogo({ className, tone = "default" }: LogoProps) {
  const textFill = tone === "inverse" ? "#FFFFFF" : "#141B2D";
  return (
    <svg
      role="img"
      aria-label="Jina AI"
      viewBox="0 0 108 32"
      className={cn("h-6 w-auto shrink-0", className)}
      fill="none"
    >
      <rect x="4" y="13" width="6" height="12" rx="3" fill="#009191" />
      <circle cx="7" cy="8.5" r="2.8" fill="#EB6161" />
      <rect x="13" y="8" width="6" height="17" rx="3" fill="#009191" />
      <rect x="22" y="11" width="6" height="14" rx="3" fill="#FBCB67" />
      <text
        x="34"
        y="21"
        fontFamily="Manrope, Inter, Arial, sans-serif"
        fontWeight="700"
        fontSize="16.5"
        letterSpacing="-0.3"
        fill={textFill}
      >
        Jina AI
      </text>
    </svg>
  );
}

/**
 * Supabase lightning bolt emblem (#3ECF8E) + wordmark.
 */
export function SupabaseLogo({ className, tone = "default" }: LogoProps) {
  const textFill = tone === "inverse" ? "#FFFFFF" : "#141B2D";
  return (
    <svg
      role="img"
      aria-label="Supabase"
      viewBox="0 0 124 32"
      className={cn("h-6 w-auto shrink-0", className)}
      fill="none"
    >
      <path
        d="M16.2 26.8C15.5 27.6 14.2 27.1 14.2 26V17.4H7.8C6.6 17.4 6 16 6.8 15.1L15.8 5.2C16.5 4.4 17.8 4.9 17.8 6V14.6H24.2C25.4 14.6 26 16 25.2 16.9L16.2 26.8Z"
        fill="#3ECF8E"
      />
      <text
        x="32"
        y="21"
        fontFamily="Manrope, Inter, Arial, sans-serif"
        fontWeight="700"
        fontSize="16.5"
        letterSpacing="-0.3"
        fill={textFill}
      >
        Supabase
      </text>
    </svg>
  );
}
