export const checkSentimentEscalation = async (text) => {
  // In a real production scenario, this could use Cohere classify endpoint,
  // AWS Comprehend, or a local NLP model to score sentiment/emotion.
  // We're simulating this by checking for strong negative trigger words.
  
  const textLower = text.toLowerCase();
  
  const extremelyAngryKeywords = [
    'hate', 'terrible', 'worst', 'disgusting', 'sue you', 
    'legal action', 'ruined', 'garbage', 'furious', 'unacceptable'
  ];

  const angryKeywords = [
    'angry', 'mad', 'upset', 'delayed', 'late', 'cold', 'missing', 'wrong'
  ];

  let score = 0;

  for (const keyword of extremelyAngryKeywords) {
    if (textLower.includes(keyword)) score += 3;
  }
  for (const keyword of angryKeywords) {
    if (textLower.includes(keyword)) score += 1;
  }

  // Threshold for immediate escalation
  if (score >= 3) {
    return {
      escalate: true,
      reason: 'Extreme frustration detected',
      // Proactive compensation / routing message
      reply: 'I sense you are extremely frustrated, and I am so sorry for this experience. I am immediately escalating this to our Senior Support Team. As an apology, here is a 20% OFF coupon code (SORRY20) for your next order. A human agent will be with you shortly.'
    };
  }

  return {
    escalate: false,
    reason: 'Normal sentiment'
  };
};
