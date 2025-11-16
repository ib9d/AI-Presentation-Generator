import { GoogleGenAI, Type, Part } from '@google/genai';
import { PresentationData, UploadedFile } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateSlides = async (projectTitle: string, projectTopics: string, file: UploadedFile | null): Promise<PresentationData | null> => {
  let prompt = `
    مهمتك هي إنشاء عرض تقديمي احترافي لمشروع تخرج وتحديد نمط تصميم له.
    عنوان المشروع هو: "${projectTitle}".
  `;

  if (file) {
    prompt += `\nلقد تم إرفاق صورة تمثل النمط البصري المطلوب (قد تكون لقطة من فيديو). قم بتحليل هذه الصورة بعناية لتحديد نظام الألوان ونمط الخط المناسب.`;
  } else {
    prompt += `\nلم يتم إرفاق صورة، لذا قم باقتراح نمط تصميم احترافي وأنيق يناسب مشروع تخرج أكاديمي.`;
  }
  
  if (projectTopics) {
    prompt += `
      \n\nيجب أن يغطي العرض التقديمي المواضيع والنقاط الرئيسية التالية:
      ${projectTopics}
    `;
  }

  prompt += `

    **متطلبات المحتوى:**
    أنشئ 10-12 شريحة باللغة العربية تغطي الهيكل القياسي لمشاريع التخرج:
    1. شريحة العنوان (العنوان، اسم الطالب - استخدم "اسم الطالب" كعنصر نائب).
    2. المقدمة والمشكلة.
    3. الأعمال السابقة.
    4. الأهداف (2-3 أهداف).
    5. المنهجية والأدوات.
    6. التصميم والتنفيذ.
    7. النتائج والمخرجات.
    8. المناقشة والتحليل.
    9. الخاتمة والاستنتاجات.
    10. العمل المستقبلي.
    11. شريحة الأسئلة.
    12. شريحة الشكر.

    لكل شريحة، قدم عنوانًا واضحًا، 3-5 نقاط رئيسية، وملاحظات للمتحدث تشرح النقاط بتفصيل.

    **متطلبات التصميم (النمط):**
    بناءً على تحليلك للصورة المرفقة (أو اقتراحك الخاص)، حدد قيم النمط التالي:
    - primaryColor: لون مميز للعناوين الرئيسية (كود HEX).
    - secondaryColor: لون خلفية الشرائح (كود HEX). يجب أن يكون مختلفاً عن لون النص.
    - textColor: لون النص الأساسي (كود HEX). يجب أن يكون واضحاً على الخلفية.
    - fontFamily: اختر بين 'serif' للخطوط التقليدية أو 'sans-serif' للخطوط الحديثة.

    قم بإرجاع الاستجابة الكاملة ككائن JSON واحد.
  `;

  const parts: Part[] = [{ text: prompt }];

  if (file && file.mimeType.startsWith('image/')) {
    parts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slides: {
              type: Type.ARRAY,
              description: 'An array of presentation slides in Arabic.',
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'The title of the slide in Arabic.' },
                  content: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'The bullet points for the slide content.' },
                  speakerNotes: { type: Type.STRING, description: 'Detailed notes for the presenter in Arabic.' },
                },
                required: ['title', 'content', 'speakerNotes'],
              },
            },
            theme: {
              type: Type.OBJECT,
              description: 'The visual theme for the presentation.',
              properties: {
                primaryColor: { type: Type.STRING, description: 'Hex code for main titles.' },
                secondaryColor: { type: Type.STRING, description: 'Hex code for the slide background.' },
                textColor: { type: Type.STRING, description: 'Hex code for the main text.' },
                fontFamily: { type: Type.STRING, description: "Font style, either 'serif' or 'sans-serif'." },
              },
              required: ['primaryColor', 'secondaryColor', 'textColor', 'fontFamily'],
            }
          },
          required: ['slides', 'theme'],
        },
      },
    });
    
    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    return parsedJson as PresentationData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate slides from Gemini API.");
  }
};
