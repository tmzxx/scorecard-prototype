export const TEMPLATES = [
  {
    id: 'general-cx',
    name: 'General CX Quality',
    criteria: [
      {
        id: 'empathy',
        name: 'Empathy & Tone',
        description: 'Agent demonstrates genuine understanding of customer frustration, uses warm and professional language, and avoids dismissive or robotic responses.',
        priority: 'standard',
      },
      {
        id: 'resolution',
        name: 'Issue Resolution',
        description: 'Agent correctly identifies the root cause and takes concrete steps to resolve the issue fully. Avoids deflecting or leaving the customer without a clear outcome.',
        priority: 'high',
      },
      {
        id: 'clarity',
        name: 'Communication Clarity',
        description: 'Agent communicates next steps, policies, or decisions in plain language. Customer should never need to ask a follow-up question to understand what happens next.',
        priority: 'standard',
      },
      {
        id: 'escalation',
        name: 'Escalation Handling',
        description: 'When a customer requests escalation, the agent acknowledges the request promptly, confirms the path forward, and does not attempt to re-deflect.',
        priority: 'standard',
      },
    ],
  },
  {
    id: 'compliance',
    name: 'Compliance & Disclosure',
    criteria: [
      {
        id: 'required-disclosures',
        name: 'Required Disclosures',
        description: 'Agent delivers all legally or contractually required disclosures at the appropriate moment in the conversation — not buried, not omitted.',
        priority: 'high',
      },
      {
        id: 'accurate-policy',
        name: 'Policy Accuracy',
        description: 'All policy statements made by the agent are factually correct and consistent with current documented policy. No improvised exceptions or incorrect claims.',
        priority: 'high',
      },
      {
        id: 'data-handling',
        name: 'Data & Privacy Handling',
        description: 'Agent follows proper identity verification steps before accessing account data. Does not share sensitive information without verification.',
        priority: 'high',
      },
      {
        id: 'records',
        name: 'Record-keeping Language',
        description: 'Agent uses precise language when describing actions taken (e.g., "I have processed your cancellation" vs "I will try to cancel"). Creates a clear record of what was committed.',
        priority: 'standard',
      },
    ],
  },
  {
    id: 'brand-voice',
    name: 'Brand Voice & Tone',
    criteria: [
      {
        id: 'on-brand',
        name: 'On-Brand Language',
        description: 'Agent uses vocabulary and phrasing consistent with the brand style guide. Avoids overly formal, stilted, or off-brand expressions.',
        priority: 'standard',
      },
      {
        id: 'positivity',
        name: 'Positive Framing',
        description: "Responses are framed in terms of what the agent can do, not what they can't. Negative outcomes are delivered with empathy and an alternative path where possible.",
        priority: 'standard',
      },
      {
        id: 'personalisation',
        name: 'Personalisation',
        description: "Agent uses the customer's name, references their specific situation, and avoids copy-paste boilerplate responses that feel generic or impersonal.",
        priority: 'standard',
      },
    ],
  },
];
