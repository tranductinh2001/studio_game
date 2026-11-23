// Curriculum Management & AI Slide Generation Service for Multi-Grade Presentations
// Handles CRUD, persistent storage, AI period distribution, and presentation synchronization

import { INITIAL_CURRICULUM_LESSONS } from '../data/curriculumSeedData';

const STORAGE_KEY = 'curriculum_lessons_db_v3';
const ACTIVE_LESSON_KEY = 'curriculum_active_lesson_id_v3';

class CurriculumService {
  constructor() {
    this.lessons = [];
    this.activeLessonId = 'lesson_tin6_bai06'; // Default to Core Bài 6
    this.listeners = new Set();
    this.init();
  }

  init() {
    if (typeof window === 'undefined') {
      this.lessons = [...INITIAL_CURRICULUM_LESSONS];
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge to ensure core Lesson 6 and official seed lessons always have updated slides
          const map = new Map();
          INITIAL_CURRICULUM_LESSONS.forEach(l => map.set(l.id, l));
          parsed.forEach(l => {
            if (l.id === 'lesson_tin6_bai06') {
              map.set(l.id, { ...l, isCoreLesson: true });
            } else if (map.has(l.id)) {
              const seed = map.get(l.id);
              if (parseFloat(seed.version || '1.0') >= parseFloat(l.version || '1.0')) {
                map.set(l.id, seed);
              } else {
                map.set(l.id, l);
              }
            } else {
              map.set(l.id, l);
            }
          });
          this.lessons = Array.from(map.values());
        } else {
          this.lessons = [...INITIAL_CURRICULUM_LESSONS];
        }
      } else {
        this.lessons = [...INITIAL_CURRICULUM_LESSONS];
      }

      const storedActiveId = localStorage.getItem(ACTIVE_LESSON_KEY);
      if (storedActiveId && this.lessons.some(l => l.id === storedActiveId)) {
        this.activeLessonId = storedActiveId;
      }

      this.saveToStorage();
    } catch (e) {
      console.warn('[CurriculumService] Init error, using fallback:', e);
      this.lessons = [...INITIAL_CURRICULUM_LESSONS];
    }
  }

  saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.lessons));
      localStorage.setItem(ACTIVE_LESSON_KEY, this.activeLessonId);
      this.notify();
    } catch (e) {
      console.error('[CurriculumService] Failed to save to localStorage:', e);
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => {
      try {
        cb(this.lessons);
      } catch (err) {
        console.error(err);
      }
    });
  }

  // Query lessons with filtering, search, and sorting
  getLessons({ grade = 'ALL', subject = 'ALL', search = '', sortBy = 'updated' } = {}) {
    let result = [...this.lessons];

    // Filter by grade (6, 7, 8, 9, etc.)
    if (grade && grade !== 'ALL') {
      const targetGrade = Number(grade);
      result = result.filter(l => Number(l.grade) === targetGrade);
    }

    // Filter by subject
    if (subject && subject !== 'ALL') {
      result = result.filter(l => l.subject?.toLowerCase() === subject.toLowerCase());
    }

    // Search query
    if (search && search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter(l =>
        l.title?.toLowerCase().includes(query) ||
        l.description?.toLowerCase().includes(query) ||
        String(l.lessonNumber).includes(query) ||
        l.subject?.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === 'updated') {
      result.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    } else if (sortBy === 'created') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'lessonNumber') {
      result.sort((a, b) => (a.lessonNumber || 0) - (b.lessonNumber || 0));
    }

    return result;
  }

  // Get single lesson
  getLessonById(id) {
    return this.lessons.find(l => l.id === id) || null;
  }

  // Get currently active presentation lesson
  getActiveLesson() {
    return this.getLessonById(this.activeLessonId) || this.lessons[0] || null;
  }

  // Set active presentation lesson
  setActiveLesson(id) {
    if (this.lessons.some(l => l.id === id)) {
      this.activeLessonId = id;
      this.saveToStorage();
    }
  }

  // Create new lesson
  createLesson(lessonData) {
    const grade = Number(lessonData.grade) || 6;
    const lessonNum = Number(lessonData.lessonNumber) || 1;
    const cleanSubject = lessonData.subject || 'Tin học';
    const slug = cleanSubject.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 3);
    const uniqueId = `lesson_${slug}${grade}_bai${String(lessonNum).padStart(2, '0')}_${Date.now().toString(36)}`;

    const newLesson = {
      id: uniqueId,
      subject: cleanSubject,
      grade,
      lessonNumber: lessonNum,
      title: lessonData.title?.trim() || `Bài ${lessonNum}`,
      shortTitle: lessonData.shortTitle || `Bài ${lessonNum}`,
      periodsCount: Math.max(1, Number(lessonData.periodsCount) || 1),
      teacherName: lessonData.teacherName || 'Thầy Trần Đức Tình',
      school: lessonData.school || 'THCS Đắk Trôi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slideCount: lessonData.slideCount || (lessonData.periods?.reduce((acc, p) => acc + (p.slides?.length || 0), 0) || 8),
      status: lessonData.status || 'draft',
      version: '1.0',
      description: lessonData.description || 'Bài giảng tạo bởi AI trợ giảng',
      isCoreLesson: false,
      periods: lessonData.periods || []
    };

    this.lessons.unshift(newLesson);
    this.activeLessonId = newLesson.id;
    this.saveToStorage();
    return newLesson;
  }

  // Update existing lesson
  updateLesson(id, updates) {
    const index = this.lessons.findIndex(l => l.id === id);
    if (index === -1) return null;

    const current = this.lessons[index];
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Calculate updated slide count if periods modified
    if (updated.periods) {
      updated.slideCount = updated.periods.reduce((acc, p) => acc + (p.slides?.length || 0), 0);
    }

    this.lessons[index] = updated;
    this.saveToStorage();
    return updated;
  }

  // Duplicate lesson
  duplicateLesson(id) {
    const original = this.getLessonById(id);
    if (!original) return null;

    const copyId = `${original.id}_copy_${Date.now().toString(36)}`;
    const cloned = JSON.parse(JSON.stringify(original));

    cloned.id = copyId;
    cloned.title = `${original.title} (Bản sao)`;
    cloned.shortTitle = `${original.shortTitle} (Copy)`;
    cloned.createdAt = new Date().toISOString();
    updatedAt: new Date().toISOString();
    cloned.status = 'draft';
    cloned.isCoreLesson = false; // Duplicates are custom editable presentations

    this.lessons.unshift(cloned);
    this.saveToStorage();
    return cloned;
  }

  // Delete lesson with safe guards (protect core Bài 6 from accidental permanent loss)
  deleteLesson(id) {
    const target = this.getLessonById(id);
    if (!target) return false;

    if (target.isCoreLesson) {
      alert('Bài 6 gốc đang phục vụ tiết thao giảng chính thức, không thể xóa bài này!');
      return false;
    }

    this.lessons = this.lessons.filter(l => l.id !== id);

    // If deleting active lesson, reset active to Core Bài 6
    if (this.activeLessonId === id) {
      this.activeLessonId = this.lessons[0]?.id || 'lesson_tin6_bai06';
    }

    this.saveToStorage();
    return true;
  }

  // AI Pedagogical Content Structuring:
  // Automatically splits raw lesson content into N periods, generates objectives, 16:9 slides, and Bloom-taxonomy questions!
  async generateAIStructure({
    subject = 'Tin học',
    grade = 8,
    lessonNumber = 8,
    title = '',
    periodsCount = 2,
    rawText = '',
    referenceNotes = ''
  }) {
    // Artificial intelligent delay for UX feel
    await new Promise(r => setTimeout(r, 800));

    const pCount = Math.max(1, Math.min(4, Number(periodsCount) || 2));
    const cleanTitle = title.trim() || `Bài ${lessonNumber}: Nội dung bài học`;
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

    // Pedagogical heuristics to extract core ideas from input text
    const paragraphs = [];
    let currentChunk = [];
    lines.forEach(l => {
      if (l.startsWith('#') || l.startsWith('I.') || l.startsWith('II.') || l.startsWith('1.') || l.startsWith('2.') || l.startsWith('Tiết')) {
        if (currentChunk.length > 0) {
          paragraphs.push(currentChunk.join(' '));
          currentChunk = [];
        }
      }
      currentChunk.push(l);
    });
    if (currentChunk.length > 0) paragraphs.push(currentChunk.join(' '));

    const periods = [];

    // Distribute content into pCount periods
    for (let p = 1; p <= pCount; p++) {
      const isFirst = p === 1;
      const isLast = p === pCount;
      const periodTitle = pCount === 1 
        ? `${cleanTitle}` 
        : isFirst 
          ? `Tiết 1: Kiến thức nền tảng & Khái niệm trọng tâm`
          : isLast 
            ? `Tiết ${p}: Thực hành chuyên sâu, Vận dụng & Đánh giá`
            : `Tiết ${p}: Mở rộng kiến thức & Hoạt động tương tác`;

      // Slice relevant paragraphs
      const chunkStartIndex = Math.floor(((p - 1) / pCount) * paragraphs.length);
      const chunkEndIndex = Math.floor((p / pCount) * paragraphs.length);
      const periodChunks = paragraphs.slice(chunkStartIndex, Math.max(chunkStartIndex + 1, chunkEndIndex));

      // Slides for this period
      const slides = [];

      // Slide 1: Bìa Tiết
      slides.push({
        id: `slide_${grade}_${lessonNumber}_p${p}_0`,
        type: 'title',
        title: `${subject.toUpperCase()} ${grade} - BÀI ${lessonNumber}`,
        subtitle: `${cleanTitle} • Tiết ${p}/${pCount}`,
        content: [
          `Khởi động: Tình huống thực tiễn mở đầu Tiết ${p}`,
          `Nội dung trọng tâm Tiết ${p}`,
          `Thực hành và bài tập tương tác`,
          `Luyện tập củng cố và tổng kết`
        ],
        notes: `Giáo viên giới thiệu mục tiêu và lộ trình học tập của Tiết ${p}.`
      });

      // Slide 2: Mục tiêu học tập
      slides.push({
        id: `slide_${grade}_${lessonNumber}_p${p}_1`,
        type: 'objective',
        title: `MỤC TIÊU CẦN ĐẠT - TIẾT ${p}`,
        subtitle: `Yêu cầu cần đạt theo Chương trình GDPT 2018`,
        content: [
          `Nêu được các khái niệm và nguyên lý cốt lõi của bài học.`,
          `Giải thích được bản chất và liên hệ với các hiện tượng thực tế.`,
          `Thực hành vận dụng kiến thức vào xử lý tình huống cụ thể.`
        ],
        notes: `Nhấn mạnh các năng lực đặc thù và phẩm chất học sinh cần phát triển.`
      });

      // Slide 3: Khởi động / Hook
      slides.push({
        id: `slide_${grade}_${lessonNumber}_p${p}_2`,
        type: 'hook',
        title: `HOẠT ĐỘNG KHỞI ĐỘNG (WARM-UP)`,
        subtitle: `Tình huống kích thích tư duy và tò mò`,
        content: [
          `Tình huống thực tế: Trong đời sống hàng ngày, chúng ta thường bắt gặp vấn đề này ở đâu?`,
          `Câu hỏi gợi mở: Làm thế nào để giải quyết vấn đề một cách khoa học và tối ưu?`,
          `Dẫn dắt vào bài học mới một cách tự nhiên và truyền cảm hứng.`
        ],
        notes: `Dành 3-5 phút cho học sinh trao đổi cặp đôi hoặc nhóm bàn.`
      });

      // Slide 4 & 5: Hình thành kiến thức
      periodChunks.slice(0, 2).forEach((chunk, cIdx) => {
        const sentences = chunk.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
        slides.push({
          id: `slide_${grade}_${lessonNumber}_p${p}_k${cIdx}`,
          type: 'concept',
          title: `KIẾN THỨC ${cIdx + 1}: ${sentences[0]?.slice(0, 50) || 'Nội dung cốt lõi'}`,
          subtitle: `Phân tích chi tiết và ví dụ minh họa`,
          content: sentences.slice(1, 5).length > 0 
            ? sentences.slice(1, 5) 
            : [
                'Khái niệm và định nghĩa chính xác theo chuẩn sư phạm.',
                'Quy tắc hoạt động và các bước thực hiện tuần tự.',
                'Lưu ý quan trọng cần tránh khi thao tác hoặc áp dụng.'
              ],
          notes: `Giáo viên dùng câu hỏi gợi ý để học sinh tự rút ra kết luận.`
        });
      });

      // Slide: Thực hành / Hoạt động
      slides.push({
        id: `slide_${grade}_${lessonNumber}_p${p}_act`,
        type: 'activity',
        title: `HOẠT ĐỘNG THỰC HÀNH & TƯƠNG TÁC (TIẾT ${p})`,
        subtitle: `Làm việc nhóm / Thao tác trực tiếp (Thời gian: 5 phút)`,
        content: [
          `Nhiệm vụ 1: Hoàn thành phiếu học tập hoặc thao tác trên máy tính/thiết bị.`,
          `Nhiệm vụ 2: Thảo luận nhóm, đối chiếu kết quả và giải thích nguyên nhân.`,
          `Nhiệm vụ 3: Đại diện nhóm báo cáo và nhận xét chéo giữa các tổ.`
        ],
        notes: `Bật đồng hồ đếm ngược tích hợp trên slide để tạo không khí thi đua.`
      });

      // Slide: Ghi nhớ / Tổng kết vở ghi
      slides.push({
        id: `slide_${grade}_${lessonNumber}_p${p}_sum`,
        type: 'summary',
        title: `TỔNG KẾT & GHI VỞ (TIẾT ${p})`,
        subtitle: `Chuẩn hóa kiến thức trọng tâm`,
        content: [
          `Cột 1: Các thuật ngữ và khái niệm khoa học cốt lõi.`,
          `Cột 2: Quy trình thực hiện, công thức hoặc lưu ý kỹ thuật.`,
          isLast 
            ? `Dặn dò: Ôn tập toàn bài và làm bài tập vận dụng về nhà.`
            : `Dặn dò: Hoàn thiện vở ghi và chuẩn bị bài cho Tiết ${p + 1}.`
        ],
        notes: `Dành 3 phút cho học sinh ghi chép khoa học vào vở.`
      });

      // Questions for this period (Bloom Taxonomy)
      const questions = [
        {
          id: `q_${grade}_${lessonNumber}_p${p}_1`,
          type: 'multiple_choice',
          bloomLevel: 'Nhận biết',
          questionText: `Nội dung cốt lõi của ${cleanTitle} (Tiết ${p}) tập trung vào điều gì?`,
          options: {
            A: 'Các định nghĩa và nguyên lý hoạt động nền tảng',
            B: 'Lịch sử phát triển trước công nguyên',
            C: 'Các phần cứng không liên quan',
            D: 'Chỉ mang tính chất tham khảo lý thuyết'
          },
          correctAnswer: 'A',
          explanation: 'Nội dung bài học xây dựng dựa trên các chuẩn kiến thức và kỹ năng cơ bản.'
        },
        {
          id: `q_${grade}_${lessonNumber}_p${p}_2`,
          type: 'multiple_choice',
          bloomLevel: 'Thông hiểu',
          questionText: `Khi vận dụng kiến thức Tiết ${p} vào tình huống thực tế, yếu tố nào cần chú ý nhất?`,
          options: {
            A: 'Thực hiện đúng quy trình và tuân thủ nguyên tắc an toàn, logic',
            B: 'Làm theo cảm tính không cần kiểm tra',
            C: 'Bỏ qua các bước kiểm chứng kết quả',
            D: 'Chỉ cần ghi nhớ lý thuyết mà không cần thực hành'
          },
          correctAnswer: 'A',
          explanation: 'Việc nắm vững bản chất và tuân thủ quy trình logic giúp giải quyết chính xác các tình huống thực tiễn.'
        }
      ];

      periods.push({
        periodNumber: p,
        title: periodTitle,
        objectives: [
          `Nắm vững nội dung trọng tâm của Tiết ${p}`,
          `Thực hành thành thạo các kỹ năng theo chuẩn chương trình GDPT`,
          `Vận dụng linh hoạt vào các bài toán và tình huống đời sống`
        ],
        keyKnowledge: periodChunks[0] || `Kiến thức nền tảng của Tiết ${p} môn ${subject} ${grade}.`,
        slides,
        questions
      });
    }

    const totalSlides = periods.reduce((acc, p) => acc + p.slides.length, 0);

    return {
      subject,
      grade: Number(grade),
      lessonNumber: Number(lessonNumber),
      title: cleanTitle,
      shortTitle: `Bài ${lessonNumber}: ${cleanTitle.split(':')[0]}`,
      periodsCount: pCount,
      slideCount: totalSlides,
      status: 'completed',
      version: '1.0',
      description: `Bài học ${subject} lớp ${grade} gồm ${pCount} tiết học, ${totalSlides} slide chuẩn 16:9 với hệ thống câu hỏi phân hóa.`,
      periods
    };
  }
}

export const curriculumService = new CurriculumService();

