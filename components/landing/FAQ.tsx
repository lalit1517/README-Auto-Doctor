"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Is Readme Auto Doctor free to use?",
    answer:
      "Yes, completely free. There are no usage limits, no subscription, and no credit card required. Just connect your GitHub account and start analyzing repositories.",
  },
  {
    question: "Does it support private repositories?",
    answer:
      "Currently Readme Auto Doctor works with public repositories. Support for private repos with appropriate scopes is on the roadmap. Stay tuned for updates.",
  },
  {
    question: "How accurate is the AI-generated README?",
    answer:
      "The AI analyzes your repository's file structure, existing README, and code patterns to generate context-aware documentation. Results are excellent for most projects. You can always review and edit before creating a PR.",
  },
  {
    question: "Can I edit the README before creating a pull request?",
    answer:
      "You can copy the improved README and edit it locally before submitting. A built-in inline editor for direct editing in the browser is planned for a future release.",
  },
  {
    question: "What happens after I create a pull request?",
    answer:
      "A PR is opened on your repository with the improved README as a commit. You review it on GitHub like any other PR — merge it, request changes, or close it. Full control stays with you.",
  },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = `faq-panel-${index}`;

  return (
    <div className="border-b border-[#1E1E35] last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-6 py-5 text-left transition-colors hover:text-[#F2F2FF]"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="font-display text-base font-medium text-[#F2F2FF]">
          {question}
        </span>
        <span
          className={`mt-0.5 flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full border border-[#2A2A48] text-[#9B9BB8] transition-all duration-200 ${
            open ? "bg-[#7C6FE0]/10 border-[#7C6FE0]/30 text-[#7C6FE0] rotate-45" : ""
          }`}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M5 1v8M1 5h8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-hidden={!open}
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-48 pb-5 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-sm text-[#9B9BB8] leading-relaxed pr-10">{answer}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="relative py-24 px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Section header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2A2A48] bg-[#0E0E1A] px-4 py-1.5 text-xs font-medium text-[#9B9BB8] mb-5">
            Got questions?
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tight text-[#F2F2FF] sm:text-5xl mb-4">
            Frequently asked
          </h2>
          <p className="text-[#9B9BB8] text-lg">
            Everything you need to know before getting started.
          </p>
        </div>

        {/* Accordion */}
        <div className="rounded-2xl border border-[#1E1E35] bg-[#0E0E1A] divide-y divide-[#1E1E35] px-6">
          {faqs.map((faq, index) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
