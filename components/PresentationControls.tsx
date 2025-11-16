import React, { useState } from 'react';
import { LoadingIcon, WandIcon, DocumentArrowUpIcon, XCircleIcon, PhotoIcon } from './Icons';
import { UploadedFile } from '../types';

interface PresentationControlsProps {
  onGenerate: (title: string, topics: string, file: UploadedFile | null) => void;
  isLoading: boolean;
}

const PresentationControls: React.FC<PresentationControlsProps> = ({ onGenerate, isLoading }) => {
  const [title, setTitle] = useState('');
  const [topics, setTopics] = useState('');
  const [styleFile, setStyleFile] = useState<UploadedFile | null>(null);
  const [styleFileDisplayName, setStyleFileDisplayName] = useState<string>('');
  const [contentFileName, setContentFileName] = useState<string>('');
  
  const extractFrameFromVideo = (videoFile: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(videoFile);
        
        video.onloadeddata = () => {
          video.currentTime = 0;
        };

        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Could not get canvas context'));
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg');
          URL.revokeObjectURL(video.src);
          resolve(dataUrl.split(',')[1]); // Return base64 data
        };

        video.onerror = (e) => {
            reject(new Error('Error loading video file.'));
        };
      });
  }

  const handleStyleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileType = selectedFile.type;

    if (fileType.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Data = (event.target?.result as string).split(',')[1];
            setStyleFile({ name: selectedFile.name, mimeType: fileType, data: base64Data });
            setStyleFileDisplayName(selectedFile.name);
        };
        reader.readAsDataURL(selectedFile);
    } else if (fileType.startsWith('video/')) {
        try {
            setStyleFileDisplayName(`جاري معالجة: ${selectedFile.name}...`);
            const base64Frame = await extractFrameFromVideo(selectedFile);
            setStyleFile({
                name: selectedFile.name,
                mimeType: 'image/jpeg',
                data: base64Frame,
            });
            setStyleFileDisplayName(`نمط من: ${selectedFile.name}`);
        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء معالجة الفيديو.");
            setStyleFileDisplayName('');
        }
    } else {
        alert("نوع الملف غير مدعوم. يرجى رفع ملف صورة أو فيديو.");
    }

    e.target.value = ''; // Reset file input
  };

  const handleContentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        setTopics(event.target?.result as string);
        setContentFileName(selectedFile.name);
    };
    reader.readAsText(selectedFile);
    e.target.value = ''; // Reset file input
  };

  const handleRemoveStyleFile = () => {
      setStyleFile(null);
      setStyleFileDisplayName('');
  }
  
  const handleRemoveContentFile = () => {
      setTopics('');
      setContentFileName('');
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && topics) {
      onGenerate(title, topics, styleFile);
    }
  };

  return (
    <div className="flex flex-col h-full">
        <div className="flex items-center mb-6">
            <WandIcon className="w-8 h-8 text-indigo-400 ml-3" />
            <h1 className="text-2xl font-bold text-white">صانع العروض</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
            <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    عنوان المشروع
                </label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: نظام توصيات أفلام باستخدام تعلم الآلة"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    نمط التصميم (اختياري)
                </label>
                <label
                    htmlFor="style-upload"
                    className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse cursor-pointer text-sm text-indigo-400 hover:text-indigo-300 transition-colors border-2 border-dashed border-gray-600 hover:border-indigo-500 rounded-md p-3"
                >
                    <PhotoIcon className="w-5 h-5" />
                    <span>إضافة نمط التصميم (صورة أو فيديو)</span>
                    <input id="style-upload" name="style-upload" type="file" className="sr-only" onChange={handleStyleFileChange} accept="image/*,video/*" />
                </label>
            </div>
            {styleFile && (
                <div className="mb-4 p-3 bg-gray-700 rounded-md flex items-center justify-between text-sm">
                    <span className="text-gray-300 truncate">{styleFileDisplayName}</span>
                    <button type="button" onClick={handleRemoveStyleFile} className="text-gray-400 hover:text-white">
                        <XCircleIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            <div className="mb-4 flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="topics" className="block text-sm font-medium text-gray-300">
                        المحتوى / النقاط الرئيسية
                    </label>
                    <label
                        htmlFor="content-upload"
                        className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        <DocumentArrowUpIcon className="w-5 h-5" />
                        <span>رفع ملف البرومبت</span>
                        <input id="content-upload" name="content-upload" type="file" className="sr-only" onChange={handleContentFileChange} accept=".txt,.md" />
                    </label>
                </div>
                <textarea
                    id="topics"
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                    placeholder="أدخل النقاط الرئيسية هنا، أو ارفع ملف البرومبت التفصيلي (.txt, .md)..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow"
                    rows={8}
                    required
                />
                {contentFileName && (
                     <div className="mt-2 p-3 bg-gray-700 rounded-md flex items-center justify-between text-sm">
                        <span className="text-gray-300 truncate">ملف المحتوى: {contentFileName}</span>
                        <button type="button" onClick={handleRemoveContentFile} className="text-gray-400 hover:text-white">
                            <XCircleIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading || !title || !topics}
                className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed mt-auto"
            >
            {isLoading ? (
                <>
                    <LoadingIcon className="w-5 h-5 ml-2 animate-spin" />
                    جاري الإنشاء...
                </>
            ) : (
                'إنشاء العرض التقديمي'
            )}
            </button>
        </form>
    </div>
  );
};

export default PresentationControls;