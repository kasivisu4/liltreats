export interface Testimonial {
  name: string;
  handle: string;
  stars: number;
  quote: string;
  color: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aisha K.",
    handle: "@aishakhan_",
    stars: 5,
    color: "#C8788E",
    quote:
      "Got the most adorable ring and a hair clip I literally can't stop wearing. Worth every rupee!",
  },
  {
    name: "Sneha R.",
    handle: "@sneha.r",
    stars: 5,
    color: "#9880C0",
    quote:
      "Premium scoop packaging was SO aesthetic. I made an unboxing reel and it got 8K views!",
  },
  {
    name: "Meera T.",
    handle: "@meeratiwari",
    stars: 4,
    color: "#6A8860",
    quote:
      "Set Monday reminders — slots vanish in 20 minutes. The mystery element is genuinely addictive.",
  },
  {
    name: "Divya P.",
    handle: "@divya.makes",
    stars: 5,
    color: "#C4945A",
    quote:
      "Ordered as a birthday gift with the video add-on. My friend cried. Best surprise ever.",
  },
];
