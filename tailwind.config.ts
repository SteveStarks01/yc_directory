import type {Config} from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./sanity/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			screens: {
				xs: "475px",
			},
			colors: {
				primary: {
					"100": "#F5F5F5",
					DEFAULT: "#000000",
					foreground: "#FFFFFF",
				},
				secondary: {
					DEFAULT: "#FFFFFF",
					foreground: "#000000",
				},
				black: {
					"100": "#333333",
					"200": "#141413",
					"300": "#7D8087",
					DEFAULT: "#000000",
				},
				white: {
					"100": "#F7F7F7",
					DEFAULT: "#FFFFFF",
				},
				// Shadcn color system
				background: "#FFFFFF",
				foreground: "#000000",
				muted: {
					DEFAULT: "#F5F5F5",
					foreground: "#737373",
				},
				accent: {
					DEFAULT: "#F5F5F5",
					foreground: "#000000",
				},
				destructive: {
					DEFAULT: "#EF4444",
					foreground: "#FFFFFF",
				},
				border: "#E5E5E5",
				input: "#E5E5E5",
				ring: "#000000",
			},
			fontFamily: {
				"work-sans": ["var(--font-work-sans)"],
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			boxShadow: {
				100: "2px 2px 0px 0px rgb(0, 0, 0)",
				200: "2px 2px 0px 2px rgb(0, 0, 0)",
				300: "2px 2px 0px 2px rgb(0, 0, 0)",
			},
		},
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;