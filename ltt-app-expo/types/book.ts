export interface SubChapter {
  title: string;
  anchor: string;
}

export interface Chapter {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  subChapters?: SubChapter[];
}

export interface BookMeta {
  title: string;
  subtitle: string;
  author: string;
  chapters: Chapter[];
}

export interface ReadingProgress {
  chapterId: string;
  scrollTop: number;
}

export interface ReaderSettings {
  fontSize: number;
  isDark: boolean;
}
