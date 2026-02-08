import preface from './chapters/preface';
import section01 from './chapters/section-01';
import section02 from './chapters/section-02';
import section03 from './chapters/section-03';
import section04 from './chapters/section-04';
import section05 from './chapters/section-05';
import section06 from './chapters/section-06';
import section07 from './chapters/section-07';
import section08 from './chapters/section-08';
import section09 from './chapters/section-09';
import section10 from './chapters/section-10';
import section11 from './chapters/section-11';
import section12 from './chapters/section-12';
import section13 from './chapters/section-13';
import section14 from './chapters/section-14';
import section15 from './chapters/section-15';
import section16 from './chapters/section-16';
import appendix from './chapters/appendix';

const chapterModules: Record<string, string> = {
  'preface': preface,
  'section-01': section01,
  'section-02': section02,
  'section-03': section03,
  'section-04': section04,
  'section-05': section05,
  'section-06': section06,
  'section-07': section07,
  'section-08': section08,
  'section-09': section09,
  'section-10': section10,
  'section-11': section11,
  'section-12': section12,
  'section-13': section13,
  'section-14': section14,
  'section-15': section15,
  'section-16': section16,
  'appendix': appendix,
};

export function loadChapter(chapterId: string): string {
  return chapterModules[chapterId] || '';
}
