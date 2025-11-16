import React from 'react';
import { SlideContent, Theme } from '../types';

interface SlideProps {
  content: SlideContent;
  theme: Theme;
}

const Slide: React.FC<SlideProps> = ({ content, theme }) => {
  if (!content) {
    return null;
  }

  const slideStyle = {
    backgroundColor: theme.secondaryColor,
    color: theme.textColor,
    fontFamily: theme.fontFamily === 'serif' ? "'Tajawal', Georgia, serif" : "'Tajawal', Arial, sans-serif",
  };
  
  const titleStyle = {
    color: theme.primaryColor,
    borderBottomColor: theme.primaryColor,
  };

  return (
    <div 
        className="w-full max-w-4xl aspect-[16/9] rounded-lg shadow-2xl p-8 flex flex-col overflow-hidden transition-colors duration-500"
        style={slideStyle}
    >
      <h2 
        className="text-4xl font-bold mb-6 border-b-4 pb-2"
        style={titleStyle}
      >
        {content.title}
      </h2>
      <ul className="space-y-4 text-2xl list-disc list-inside flex-grow">
        {content.content.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    </div>
  );
};

export default Slide;
