export interface SlideContent {
  title: string;
  content: string[];
  speakerNotes: string;
}

export interface UploadedFile {
  name: string;
  mimeType: string;
  data: string; // base64 encoded string, without data:mime/type;base64, prefix
}

export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  fontFamily: 'serif' | 'sans-serif';
}

export interface PresentationData {
  slides: SlideContent[];
  theme: Theme;
}
