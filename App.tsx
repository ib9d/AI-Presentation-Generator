import React, { useState, useCallback } from 'react';
import { PresentationData, UploadedFile } from './types';
import { generateSlides } from './services/geminiService';
import { exportToPptx } from './services/pptxService';
import PresentationControls from './components/PresentationControls';
import Slide from './components/Slide';
import { LoadingIcon, PresentationIcon } from './components/Icons';

const App: React.FC = () => {
  const [presentationData, setPresentationData] = useState<PresentationData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (title: string, topics: string, file: UploadedFile | null) => {
    setIsLoading(true);
    setError(null);
    setPresentationData(null);
    setCurrentSlide(0);

    try {
      const generatedData = await generateSlides(title, topics, file);
      if (generatedData && generatedData.slides.length > 0) {
        setPresentationData(generatedData);
      } else {
        setError('لم يتمكن الذكاء الاصطناعي من إنشاء الشرائح. يرجى المحاولة مرة أخرى بنص مختلف.');
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء إنشاء العرض التقديمي. يرجى التحقق من وحدة التحكم لمزيد من التفاصيل.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (presentationData) {
      exportToPptx(presentationData.slides, presentationData.theme);
    }
  }, [presentationData]);

  const slides = presentationData?.slides || [];

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-gray-100">
      <div className="w-full md:w-1/3 lg:w-1/4 p-6 bg-gray-800 shadow-lg overflow-y-auto">
        <PresentationControls onGenerate={handleGenerate} isLoading={isLoading} />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-900">
        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center">
            <LoadingIcon className="w-16 h-16 animate-spin mb-4 text-indigo-400" />
            <h2 className="text-2xl font-bold text-gray-300">جاري إنشاء تحفتك الفنية...</h2>
            <p className="text-gray-400 mt-2">يقوم الذكاء الاصطناعي بصياغة العرض التقديمي الخاص بك. قد يستغرق هذا بضع لحظات.</p>
          </div>
        )}
        {error && (
            <div className="flex flex-col items-center justify-center text-center bg-red-900/20 border border-red-500 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-red-400">حدث خطأ</h2>
                <p className="text-red-300 mt-2">{error}</p>
            </div>
        )}
        {!isLoading && !error && slides.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center text-gray-500">
            <PresentationIcon className="w-24 h-24 mb-4"/>
            <h2 className="text-2xl font-bold">مولّد العروض التقديمية بالذكاء الاصطناعي</h2>
            <p className="mt-2 max-w-md">أدخل عنوان مشروعك، ارفع فيديو أو صورة لاستلهام النمط، ثم اكتب النقاط الرئيسية لإنشاء عرض مذهل.</p>
          </div>
        )}
        {!isLoading && presentationData && slides.length > 0 && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Slide content={slides[currentSlide]} theme={presentationData.theme} />
            <div className="flex items-center justify-between w-full max-w-4xl mt-4">
              <button
                onClick={goToPrevSlide}
                className="px-6 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-600"
              >
                السابق
              </button>
              <span className="text-lg font-medium">
                شريحة {currentSlide + 1} من {slides.length}
              </span>
              <button
                onClick={goToNextSlide}
                className="px-6 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-600"
              >
                التالي
              </button>
            </div>
             <div className="mt-6">
                <button
                    onClick={handleDownload}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                >
                    تحميل كملف PowerPoint
                </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
