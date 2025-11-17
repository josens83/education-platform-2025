-- ============================================
-- 샘플 데이터: 책, 챕터, 콘텐츠
-- ============================================

-- 책 1: 초등 영어 - Charlie and the Chocolate Factory (축약판)
INSERT INTO books (title, slug, subtitle, description, category_id, cover_image_url, author, difficulty_level, target_grade, estimated_hours, is_published, is_featured)
VALUES (
  'Charlie and the Chocolate Factory',
  'charlie-chocolate-factory',
  '찰리와 초콜릿 공장 (초등용 축약판)',
  '가난한 소년 찰리가 신비로운 초콜릿 공장에 초대받아 겪는 모험 이야기입니다. 쉬운 영어로 재구성한 초등학생용 버전입니다.',
  1, -- 초등 영어
  'https://images.unsplash.com/photo-1583262074089-04e1c64aa6a8?w=400',
  'Roald Dahl (Simplified)',
  'beginner',
  'elementary_5',
  3,
  true,
  true
);

-- 책 2: 중등 영어 - The Little Prince (중급판)
INSERT INTO books (title, slug, subtitle, description, category_id, cover_image_url, author, difficulty_level, target_grade, estimated_hours, is_published, is_featured)
VALUES (
  'The Little Prince',
  'the-little-prince',
  '어린 왕자 (중등용 원문)',
  '사막에 불시착한 조종사가 만난 어린 왕자와의 대화를 통해 인생의 소중한 가치를 배우는 이야기입니다.',
  2, -- 중등 영어
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
  'Antoine de Saint-Exupéry',
  'intermediate',
  'middle_2',
  5,
  true,
  true
);

-- 책 3: 고등 영어 - 1984 (고급판)
INSERT INTO books (title, slug, subtitle, description, category_id, cover_image_url, author, difficulty_level, target_grade, estimated_hours, is_published, is_featured)
VALUES (
  '1984 (Selected Chapters)',
  '1984-selected-chapters',
  '1984 주요 챕터 발췌 (고등용)',
  '전체주의 사회를 그린 조지 오웰의 디스토피아 소설. 고등학생을 위한 주요 챕터 발췌본입니다.',
  3, -- 고등 영어
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',
  'George Orwell',
  'advanced',
  'high_3',
  8,
  true,
  false
);

-- ============================================
-- Charlie and the Chocolate Factory 챕터들
-- ============================================

-- Chapter 1: The Bucket Family
INSERT INTO chapters (book_id, chapter_number, title, slug, content, content_type, estimated_minutes, is_published, display_order)
VALUES (
  1,
  1,
  'The Bucket Family',
  'the-bucket-family',
  '<div class="chapter-content">
    <h2>Chapter 1: The Bucket Family</h2>

    <p>Charlie Bucket lived with his parents and four grandparents in a small wooden house. They were very poor. The house had only two rooms and one bed.</p>

    <p>The four old grandparents were so tired that they never got out of bed. They were:</p>

    <ul>
      <li>Grandpa Joe and Grandma Josephine</li>
      <li>Grandpa George and Grandma Georgina</li>
    </ul>

    <p>Every day, Charlie walked past a huge chocolate factory. The factory belonged to Mr. Willy Wonka. It was the largest chocolate factory in the world!</p>

    <p>The smell of melting chocolate filled the air. Charlie loved chocolate more than anything in the world. But his family was too poor to buy chocolate bars.</p>

    <p>Charlie only got one chocolate bar a year - on his birthday. When that special day came, the whole family would save money for months to buy one small chocolate bar.</p>
  </div>',
  'html',
  10,
  true,
  1
);

-- Chapter 2: The Golden Tickets
INSERT INTO chapters (book_id, chapter_number, title, slug, content, content_type, estimated_minutes, is_published, display_order)
VALUES (
  1,
  2,
  'The Golden Tickets',
  'the-golden-tickets',
  '<div class="chapter-content">
    <h2>Chapter 2: The Golden Tickets</h2>

    <p>One day, Mr. Willy Wonka made an announcement. He hid five Golden Tickets inside chocolate bars. The five children who found the Golden Tickets would win a special prize!</p>

    <p>They would visit the chocolate factory and see all the secrets inside. One lucky child would win an extra special prize at the end.</p>

    <p>"I want to go!" said Charlie. "More than anything in the world!"</p>

    <p>But what chance did he have? He only got one chocolate bar a year. Other children could buy hundreds of chocolate bars.</p>

    <p>Soon, the news came on the radio:</p>

    <ol>
      <li>The first Golden Ticket was found by Augustus Gloop, a very fat boy who loved eating.</li>
      <li>The second was found by Veruca Salt, a rich girl who always got what she wanted.</li>
      <li>The third went to Violet Beauregarde, a girl who chewed gum all day.</li>
      <li>The fourth was found by Mike Teavee, a boy who only watched television.</li>
    </ol>

    <p>Charlie felt sad. There was only one Golden Ticket left, and his birthday was still far away.</p>
  </div>',
  'html',
  12,
  true,
  2
);

-- Chapter 3: Charlie Finds a Ticket
INSERT INTO chapters (book_id, chapter_number, title, slug, content, content_type, estimated_minutes, is_published, display_order)
VALUES (
  1,
  3,
  'Charlie Finds a Ticket',
  'charlie-finds-ticket',
  '<div class="chapter-content">
    <h2>Chapter 3: Charlie Finds a Ticket</h2>

    <p>One day, Charlie found a dollar bill in the snow! He was walking home from school when he saw it on the ground.</p>

    <p>Charlie was so hungry. He hadn''t eaten a proper meal in days. He decided to buy one chocolate bar.</p>

    <p>He went into a shop and bought a Wonka Whipple-Scrumptious Fudgemallow Delight. He ate it in just seconds. It was delicious!</p>

    <p>"I''ll buy one more," Charlie thought. He still had some money left.</p>

    <p>The shopkeeper gave him the chocolate bar. Charlie opened it very slowly. Suddenly, he saw something shining under the wrapper.</p>

    <p>It was GOLD!</p>

    <p>"It''s a Golden Ticket!" screamed the shopkeeper. "You found the last Golden Ticket!"</p>

    <p>People crowded around Charlie. They offered him money for the ticket. "I''ll give you fifty dollars!" shouted one man.</p>

    <p>But Charlie held the ticket tight. "No," he said. "I''m going to keep it."</p>

    <p>He ran all the way home to show his family. Everyone was so happy! Grandpa Joe even jumped out of bed for the first time in twenty years!</p>

    <p>"I knew you would find it, Charlie!" said Grandpa Joe with tears in his eyes.</p>
  </div>',
  'html',
  15,
  true,
  3
);

-- ============================================
-- The Little Prince 챕터들
-- ============================================

-- Chapter 1: The Narrator Meets the Prince
INSERT INTO chapters (book_id, chapter_number, title, slug, content, content_type, estimated_minutes, is_published, display_order)
VALUES (
  2,
  1,
  'The Narrator Meets the Prince',
  'narrator-meets-prince',
  '<div class="chapter-content">
    <h2>Chapter 1: The Narrator Meets the Prince</h2>

    <p>Six years ago, I had an accident with my plane in the Sahara Desert. Something in the engine broke. I was completely alone, a thousand miles from any human habitation.</p>

    <p>I had to try to repair the engine by myself. It was a matter of life or death. I had only enough drinking water for eight days.</p>

    <p>On the first night, I went to sleep on the sand. I was more isolated than a shipwrecked sailor on a raft in the middle of the ocean.</p>

    <p>You can imagine my surprise when a strange little voice woke me at daybreak:</p>

    <p>"Please... draw me a sheep!"</p>

    <p>"What?"</p>

    <p>"Draw me a sheep!"</p>

    <p>I jumped to my feet as if struck by lightning. I looked around carefully. I saw a most extraordinary small person looking at me seriously.</p>

    <p>He was a little boy with golden hair. He did not seem lost or tired or hungry or afraid. There was nothing about him that suggested a child lost in the desert.</p>

    <p>"But... what are you doing here?" I asked.</p>

    <p>"Please... draw me a sheep," he replied, as if it were the most normal request in the world.</p>
  </div>',
  'html',
  12,
  true,
  1
);

-- Chapter 2: The Little Prince''s Planet
INSERT INTO chapters (book_id, chapter_number, title, slug, content, content_type, estimated_minutes, is_published, display_order)
VALUES (
  2,
  2,
  'The Little Prince''s Planet',
  'little-princes-planet',
  '<div class="chapter-content">
    <h2>Chapter 2: The Little Prince''s Planet</h2>

    <p>It took me a long time to understand where he came from. The little prince asked me many questions, but he never seemed to hear mine.</p>

    <p>Little by little, I learned about his story. He came from a very small planet. It was scarcely bigger than a house!</p>

    <p>"What is your planet like?" I asked.</p>

    <p>"It is very small," he said. "I can watch the sunset whenever I want. I just move my chair a few steps."</p>

    <p>His planet was called Asteroid B-612. It was so small that the little prince could watch 44 sunsets in a single day!</p>

    <p>On his planet, there were terrible seeds. These were baobab tree seeds. If you did not pull them up immediately, they would grow enormous and break the planet apart.</p>

    <p>"You must always clean your planet," the little prince told me. "Every morning, after washing and dressing, you must clean your planet carefully."</p>

    <p>One day, a mysterious flower appeared on his planet. She was beautiful and proud. The little prince fell in love with her.</p>

    <p>But the flower was vain and demanding. She made the little prince very unhappy with her difficult behavior.</p>

    <p>"I should not have listened to her," the little prince confessed. "One never should listen to flowers. One should simply look at them and breathe their fragrance."</p>
  </div>',
  'html',
  15,
  true,
  2
);

-- ============================================
-- 1984 챕터들
-- ============================================

-- Chapter 1: Big Brother is Watching
INSERT INTO chapters (book_id, chapter_number, title, slug, content, content_type, estimated_minutes, is_published, display_order)
VALUES (
  3,
  1,
  'Big Brother is Watching',
  'big-brother-watching',
  '<div class="chapter-content">
    <h2>Chapter 1: Big Brother is Watching</h2>

    <p>It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions.</p>

    <p>Inside the flat, a fruity voice was reading out a list of figures. The voice came from a metal plaque like a dulled mirror which formed part of the surface of the right-hand wall.</p>

    <p>This was the telescreen. It could not be turned off completely. Winston kept his back turned to the telescreen. It was safer that way, though he knew that even a back can be revealing.</p>

    <p>On the opposite wall, there was a poster. It showed an enormous face, more than a meter wide. The face was that of a man of about forty-five, with a heavy black mustache.</p>

    <p>BIG BROTHER IS WATCHING YOU, the caption beneath it ran.</p>

    <p>Winston made for the stairs. It was no use trying the lift. Even at the best of times it was seldom working. The electricity was cut off during daylight hours as part of the economy drive.</p>

    <p>On each landing, opposite the lift shaft, the poster with the enormous face gazed from the wall. BIG BROTHER IS WATCHING YOU, the caption said.</p>

    <p>Winston lived in a world of perpetual war, omnipresent government surveillance, and public manipulation. The Party controlled everything - history, language, and even thought itself.</p>

    <p>Inside his flat, Winston moved to a small alcove which was probably intended to hold bookshelves. Here, he was out of range of the telescreen.</p>

    <p>He pulled out a small diary and began to write. This simple act was dangerous. Thoughtcrime, they called it. Winston knew that writing his thoughts could mean death or twenty-five years in a forced labor camp.</p>

    <p>But he continued writing anyway.</p>
  </div>',
  'html',
  20,
  true,
  1
);

-- Chapter 2: Room 101
INSERT INTO chapters (book_id, chapter_number, title, slug, content, content_type, estimated_minutes, is_published, display_order)
VALUES (
  3,
  2,
  'Two Minutes Hate',
  'two-minutes-hate',
  '<div class="chapter-content">
    <h2>Chapter 2: Two Minutes Hate</h2>

    <p>It was nearly eleven hundred hours, and in the Records Department everyone was getting ready for the Two Minutes Hate.</p>

    <p>Winston joined the crowd in front of the large telescreen. The program was about to begin. There was a roar of rage from the crowd.</p>

    <p>The Hate had started. As usual, the face of Emmanuel Goldstein, the Enemy of the People, had flashed on the screen. He was the primal traitor, the earliest defiler of the Party''s purity.</p>

    <p>Goldstein was delivering his usual speech - attacking the Party, demanding freedom of speech and freedom of the press. The speech was designed to enrage the watchers.</p>

    <p>People in the audience were shouting at the screen. Some were even throwing things at it.</p>

    <p>Behind Winston, a dark-haired girl was screaming "Swine! Swine! Swine!" at Goldstein''s face on the screen. Her face had turned a milky pink.</p>

    <p>The horrible thing about the Two Minutes Hate was not that one was obliged to act a part, but that it was impossible to avoid joining in. A hideous ecstasy of fear and vindictiveness seemed to flow through the whole group of people like an electric current.</p>

    <p>Suddenly, Goldstein''s face disappeared from the screen. In its place appeared the face of Big Brother, black-haired, black-mustachio''d, full of power and mysterious calm.</p>

    <p>Nobody heard what Big Brother was saying. It was merely a few words of encouragement, the sort of words that are uttered in the din of battle. Yet they had the effect of restoring people''s confidence.</p>

    <p>The Hate ended. Everyone went back to their work. Winston felt exhausted, as he always did after the Two Minutes Hate.</p>
  </div>',
  'html',
  18,
  true,
  2
);

-- ============================================
-- 샘플 오디오 파일 (데모용 placeholder)
-- ============================================

-- Charlie and the Chocolate Factory 오디오
INSERT INTO audio_files (chapter_id, file_url, duration_seconds, file_size_bytes, audio_type, transcript)
VALUES (
  1,
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  600,
  9600000,
  'professional',
  'Charlie Bucket lived with his parents and four grandparents in a small wooden house...'
);

INSERT INTO audio_files (chapter_id, file_url, duration_seconds, file_size_bytes, audio_type, transcript)
VALUES (
  2,
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  720,
  11520000,
  'professional',
  'One day, Mr. Willy Wonka made an announcement...'
);

-- The Little Prince 오디오
INSERT INTO audio_files (chapter_id, file_url, duration_seconds, file_size_bytes, audio_type, transcript)
VALUES (
  4,
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  720,
  11520000,
  'professional',
  'Six years ago, I had an accident with my plane in the Sahara Desert...'
);
