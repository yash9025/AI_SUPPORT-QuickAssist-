export const processImageMock = async (imageUrl) => {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // Basic mocked logic: if URL contains 'spill' or 'ruin', simulate an auto-refund.
  if (imageUrl.includes('spill') || imageUrl.includes('ruin') || imageUrl.includes('damage')) {
    return {
      success: true,
      claimValid: true,
      description: 'Image verification successful: Damaged item detected.',
      resolution: 'I have analyzed the image and verified the damage. A full refund has been automatically initiated to your original payment method. We are so sorry for this.'
    };
  }

  // Generic fallback
  return {
    success: true,
    claimValid: false,
    description: 'Image verification complete.',
    resolution: 'Thank you for the image. I have attached it to your case file for our human agents to review.'
  };
};
