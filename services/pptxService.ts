import { SlideContent, Theme } from '../types';

// The PptxGenJS library is loaded from a CDN, so we declare it to satisfy TypeScript
declare var PptxGenJS: any;

export const exportToPptx = (slides: SlideContent[], theme: Theme): void => {
  if (typeof PptxGenJS === 'undefined') {
    console.error('PptxGenJS is not loaded!');
    alert('حدث خطأ أثناء محاولة إنشاء ملف PowerPoint. المكتبة المطلوبة غير متوفرة.');
    return;
  }

  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';

  // Define a master slide for consistent theming
  pres.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: theme.secondaryColor.replace('#', '') },
  });

  const fontFace = theme.fontFamily === 'serif' ? 'Georgia' : 'Arial';

  slides.forEach(slideData => {
    const slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });

    // Title
    slide.addText(slideData.title, {
      x: 0.5,
      y: 0.25,
      w: '90%',
      h: 1,
      fontSize: 32,
      bold: true,
      color: theme.primaryColor.replace('#', ''),
      align: pres.AlignH.right,
      fontFace: fontFace,
    });

    // Content bullet points
    if (slideData.content && slideData.content.length > 0) {
        const contentPoints = slideData.content.map(point => ({
            text: point,
            options: {
                fontSize: 18,
                color: theme.textColor.replace('#', ''),
                bullet: true,
                paraSpaceAfter: 10,
                fontFace: fontFace,
            }
        }));

        slide.addText(contentPoints, {
            x: 0.5,
            y: 1.5,
            w: '90%',
            h: '70%',
            align: pres.AlignH.right,
        });
    }


    // Speaker Notes
    slide.addNotes(slideData.speakerNotes);
  });

  pres.writeFile({ fileName: 'Graduation-Project-Presentation.pptx' })
    .catch(err => {
        console.error('Error writing PPTX file:', err);
        alert('فشل حفظ ملف PowerPoint. يرجى التحقق من إعدادات المتصفح والمحاولة مرة أخرى.');
    });
};
