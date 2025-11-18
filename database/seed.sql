-- ============================================
-- 데이터베이스 시드 데이터 (데모/테스트용)
-- ============================================
-- 주의: 이 스크립트는 개발/테스트 환경에서만 사용하세요.
-- 프로덕션 환경에서는 실행하지 마세요!

-- 기존 데이터 삭제 (개발 환경 전용)
-- TRUNCATE TABLE quiz_attempts, quiz_questions, quizzes CASCADE;
-- TRUNCATE TABLE learning_progress, bookmarks, notes, vocabulary_items CASCADE;
-- TRUNCATE TABLE learning_stats CASCADE;
-- TRUNCATE TABLE subscriptions CASCADE;
-- TRUNCATE TABLE audio_files, chapters, books CASCADE;
-- TRUNCATE TABLE user_profiles, users CASCADE;

-- ============================================
-- 1. 사용자 생성
-- ============================================
-- 비밀번호: "password123" (bcrypt 해시)
INSERT INTO users (email, password_hash, username, role) VALUES
('admin@example.com', '$2b$10$rOJ5JKKjKjKjKjKjKjKjKOZvLxH7F.pQqYYqYYqYYqYYqYYqYYqYY', 'Admin User', 'admin'),
('teacher@example.com', '$2b$10$rOJ5JKKjKjKjKjKjKjKjKOZvLxH7F.pQqYYqYYqYYqYYqYYqYYqYY', 'Teacher Kim', 'teacher'),
('student1@example.com', '$2b$10$rOJ5JKKjKjKjKjKjKjKjKOZvLxH7F.pQqYYqYYqYYqYYqYYqYYqYY', 'Student Lee', 'student'),
('student2@example.com', '$2b$10$rOJ5JKKjKjKjKjKjKjKjKOZvLxH7F.pQqYYqYYqYYqYYqYYqYYqYY', 'Student Park', 'student')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. 사용자 프로필 생성
-- ============================================
INSERT INTO user_profiles (user_id, full_name, grade_level, target_exam, is_kids_mode)
SELECT id, username, 
  CASE 
    WHEN username LIKE '%Student%' THEN 'high_school'
    ELSE 'adult'
  END,
  CASE 
    WHEN username LIKE '%Student%' THEN 'toeic'
    ELSE NULL
  END,
  false
FROM users
WHERE email IN ('admin@example.com', 'teacher@example.com', 'student1@example.com', 'student2@example.com')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 3. 구독 플랜 생성 (이미 있을 수 있음)
-- ============================================
INSERT INTO subscription_plans (name, description, price, billing_cycle, duration_days, features, is_active) VALUES
('무료 체험', '제한된 콘텐츠로 플랫폼을 체험해보세요', 0, 'trial', 30, '{"max_books": 3, "has_audio": false, "has_quiz": true}', true),
('월간 플랜', '모든 콘텐츠를 한 달간 무제한 이용', 9900, 'monthly', 30, '{"max_books": -1, "has_audio": true, "has_quiz": true, "has_download": false}', true),
('연간 플랜', '1년 구독으로 20% 할인 혜택', 99000, 'annual', 365, '{"max_books": -1, "has_audio": true, "has_quiz": true, "has_download": true, "has_ai_tutor": true}', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 4. 구독 생성 (학생들에게)
-- ============================================
INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date)
SELECT u.id, sp.id, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'
FROM users u
CROSS JOIN subscription_plans sp
WHERE u.email = 'student1@example.com' AND sp.name = '월간 플랜'
ON CONFLICT DO NOTHING;

INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date)
SELECT u.id, sp.id, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days'
FROM users u
CROSS JOIN subscription_plans sp
WHERE u.email = 'student2@example.com' AND sp.name = '연간 플랜'
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. 책 생성
-- ============================================
INSERT INTO books (title, author, description, difficulty_level, category, target_grade, cover_image_url, estimated_hours, is_featured) VALUES
('The Little Prince', 'Antoine de Saint-Exupéry', '어린 왕자의 감동적인 이야기. 초급자도 쉽게 읽을 수 있는 영어 원서입니다.', 'beginner', 'fiction', 'elementary,middle', '/covers/little-prince.jpg', 5, true),
('Charlotte''s Web', 'E.B. White', '거미 샬롯과 돼지 윌버의 우정 이야기. 아름다운 영어 표현을 배울 수 있습니다.', 'beginner', 'fiction', 'elementary,middle', '/covers/charlottes-web.jpg', 6, true),
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', '마법 세계의 모험. 중급 학습자에게 적합한 판타지 소설입니다.', 'intermediate', 'fiction', 'middle,high', '/covers/harry-potter.jpg', 12, true),
('The Great Gatsby', 'F. Scott Fitzgerald', '1920년대 미국을 배경으로 한 고전. 고급 영어 표현과 문학적 깊이가 있습니다.', 'advanced', 'fiction', 'high,adult', '/covers/great-gatsby.jpg', 8, false),
('Business English Today', 'Various Authors', '비즈니스 영어 학습을 위한 실용서. TOEIC 준비에 유용합니다.', 'intermediate', 'business', 'adult', '/covers/business-english.jpg', 10, false)
ON CONFLICT (title, author) DO NOTHING;

-- ============================================
-- 6. 챕터 생성 (The Little Prince)
-- ============================================
INSERT INTO chapters (book_id, chapter_number, title, content, content_text, word_count, estimated_minutes)
SELECT b.id, 1, 'Chapter 1: The Hat and the Elephant',
'<h2>Chapter 1</h2>
<p>Once when I was six years old I saw a magnificent picture in a book, called <em>True Stories from Nature</em>, about the primeval forest. It was a picture of a boa constrictor in the act of swallowing an animal.</p>
<p>In the book it said: "Boa constrictors swallow their prey whole, without chewing it. After that they are not able to move, and they sleep through the six months that they need for digestion."</p>
<p>I pondered deeply, then, over the adventures of the jungle. And after some work with a colored pencil I succeeded in making my first drawing.</p>',
'Once when I was six years old I saw a magnificent picture in a book...',
250, 5
FROM books b WHERE b.title = 'The Little Prince'
ON CONFLICT (book_id, chapter_number) DO NOTHING;

INSERT INTO chapters (book_id, chapter_number, title, content, content_text, word_count, estimated_minutes)
SELECT b.id, 2, 'Chapter 2: Meeting the Little Prince',
'<h2>Chapter 2</h2>
<p>So I lived my life alone, without anyone that I could really talk to, until I had an accident with my plane in the Desert of Sahara, six years ago.</p>
<p>Something was broken in my engine. And as I had with me neither a mechanic nor any passengers, I set myself to attempt the difficult repairs all alone.</p>',
'So I lived my life alone, without anyone that I could really talk to...',
180, 4
FROM books b WHERE b.title = 'The Little Prince'
ON CONFLICT (book_id, chapter_number) DO NOTHING;

-- ============================================
-- 7. 퀴즈 생성
-- ============================================
INSERT INTO quizzes (chapter_id, title, description, passing_score, time_limit_minutes)
SELECT c.id, 'Chapter 1 Comprehension Quiz', 
'Test your understanding of Chapter 1',
70, 10
FROM chapters c
JOIN books b ON c.book_id = b.id
WHERE b.title = 'The Little Prince' AND c.chapter_number = 1
ON CONFLICT (chapter_id, title) DO NOTHING;

-- ============================================
-- 8. 퀴즈 문제 생성
-- ============================================
INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, points)
SELECT q.id,
'How old was the narrator when he saw the picture?',
'multiple_choice',
'["4 years old", "6 years old", "8 years old", "10 years old"]'::jsonb,
'6 years old',
'The narrator says "Once when I was six years old..."',
10
FROM quizzes q
JOIN chapters c ON q.chapter_id = c.id
JOIN books b ON c.book_id = b.id
WHERE b.title = 'The Little Prince' AND c.chapter_number = 1
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, points)
SELECT q.id,
'What animal was in the picture?',
'multiple_choice',
'["Snake", "Elephant", "Boa constrictor", "Tiger"]'::jsonb,
'Boa constrictor',
'The text mentions "a boa constrictor in the act of swallowing an animal"',
10
FROM quizzes q
JOIN chapters c ON q.chapter_id = c.id
JOIN books b ON c.book_id = b.id
WHERE b.title = 'The Little Prince' AND c.chapter_number = 1
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. 학습 진도 생성 (student1)
-- ============================================
INSERT INTO learning_progress (user_id, book_id, chapter_id, progress_percentage, last_accessed_at)
SELECT u.id, b.id, c.id, 100, NOW() - INTERVAL '1 day'
FROM users u
CROSS JOIN books b
JOIN chapters c ON c.book_id = b.id
WHERE u.email = 'student1@example.com' 
  AND b.title = 'The Little Prince'
  AND c.chapter_number = 1
ON CONFLICT (user_id, chapter_id) DO NOTHING;

-- ============================================
-- 10. 퀴즈 시도 기록
-- ============================================
INSERT INTO quiz_attempts (user_id, quiz_id, score, total_questions, correct_answers, percentage, time_spent_seconds, is_passed)
SELECT u.id, q.id, 20, 2, 2, 100, 120, true
FROM users u
CROSS JOIN quizzes q
JOIN chapters c ON q.chapter_id = c.id
JOIN books b ON c.book_id = b.id
WHERE u.email = 'student1@example.com'
  AND b.title = 'The Little Prince'
  AND c.chapter_number = 1
ON CONFLICT DO NOTHING;

-- ============================================
-- 11. 단어장 아이템
-- ============================================
INSERT INTO vocabulary_items (user_id, word, definition, example_sentence, chapter_id, proficiency_level)
SELECT u.id, 'magnificent', 'Very beautiful or impressive', 
'I saw a magnificent picture in a book.', c.id, 'learning'
FROM users u
CROSS JOIN chapters c
JOIN books b ON c.book_id = b.id
WHERE u.email = 'student1@example.com'
  AND b.title = 'The Little Prince'
  AND c.chapter_number = 1
ON CONFLICT DO NOTHING;

INSERT INTO vocabulary_items (user_id, word, definition, example_sentence, chapter_id, proficiency_level)
SELECT u.id, 'primeval', 'Ancient; belonging to the earliest times', 
'The primeval forest was full of mystery.', c.id, 'mastered'
FROM users u
CROSS JOIN chapters c
JOIN books b ON c.book_id = b.id
WHERE u.email = 'student1@example.com'
  AND b.title = 'The Little Prince'
  AND c.chapter_number = 1
ON CONFLICT DO NOTHING;

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ 시드 데이터 생성 완료!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 생성된 데이터:';
  RAISE NOTICE '  - 사용자: 4명 (admin, teacher, student1, student2)';
  RAISE NOTICE '  - 책: 5권';
  RAISE NOTICE '  - 챕터: 2개 (The Little Prince)';
  RAISE NOTICE '  - 퀴즈: 1개 (2문제)';
  RAISE NOTICE '  - 구독: 2개 (활성)';
  RAISE NOTICE '';
  RAISE NOTICE '🔑 로그인 정보:';
  RAISE NOTICE '  관리자: admin@example.com / password123';
  RAISE NOTICE '  교사: teacher@example.com / password123';
  RAISE NOTICE '  학생1: student1@example.com / password123';
  RAISE NOTICE '  학생2: student2@example.com / password123';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  주의: 비밀번호 해시는 실제 "password123"과 다릅니다.';
  RAISE NOTICE '  실제 환경에서는 bcrypt로 올바르게 해시된 비밀번호를 사용하세요.';
END $$;
