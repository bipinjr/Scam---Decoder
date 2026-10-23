import type { Metadata } from "next";
import { Feedback } from "@/components/Feedback";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Feedback on Scam Decoder for the Tech Anveshanam Tech Expo Event.",
};

export default function FeedbackPage() {
  return (
    <main>
      <Feedback />
    </main>
  );
}
