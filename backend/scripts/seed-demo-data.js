/**
 * Demo Data Seeding Script
 *
 * 데모 및 테스트용 종합 데이터를 생성합니다.
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// 샘플 데이터
const SAMPLE_DATA = {
  categories: [
    { name: 'Classic Literature', description: '고전 문학 작품' },
    { name: 'Science Fiction', description: '공상 과학 소설' },
    { name: 'Mystery & Thriller', description: '미스터리 & 스릴러' },
    { name: 'Business & Economics', description: '비즈니스 & 경제' },
    { name: 'Self-Help', description: '자기계발' },
  ],

  books: [
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      description: '1920년대 미국을 배경으로 한 고전 소설',
      difficulty: 'intermediate',
      cover_image_url: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
      target_audience: 'adult',
      estimated_reading_time: 180,
    },
    {
      title: '1984',
      author: 'George Orwell',
      description: '디스토피아 사회를 그린 SF 고전',
      difficulty: 'advanced',
      cover_image_url: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
      target_audience: 'adult',
      estimated_reading_time: 240,
    },
    {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      description: '판타지 모험 소설',
      difficulty: 'beginner',
      cover_image_url: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
      target_audience: 'young-adult',
      estimated_reading_time: 300,
    },
  ],

  chapters: [
    { title: 'Chapter 1: In My Younger Years', chapter_number: 1 },
    { title: 'Chapter 2: The Valley of Ashes', chapter_number: 2 },
    { title: 'Chapter 3: The Party', chapter_number: 3 },
  ],

  users: [
    {
      email: 'admin@example.com',
      username: 'Admin User',
      password: 'Admin1234!',
      role: 'admin',
    },
    {
      email: 'teacher@example.com',
      username: 'Teacher John',
      password: 'Teacher1234!',
      role: 'teacher',
    },
    {
      email: 'student@example.com',
      username: 'Student Alice',
      password: 'Student1234!',
      role: 'student',
    },
    {
      email: 'demo@example.com',
      username: 'Demo User',
      password: 'Demo1234!',
      role: 'student',
    },
  ],

  subscriptionPlans: [
    {
      name: '무료 체험',
      description: '7일 무료 체험',
      price: 0,
      duration_days: 7,
      features: JSON.stringify(['기본 도서 접근', '제한된 퀴즈']),
      stripe_price_id: 'price_free',
      billing_cycle: 'one_time',
    },
    {
      name: '월간 플랜',
      description: '한 달 무제한 이용',
      price: 990,
      duration_days: 30,
      features: JSON.stringify(['모든 도서 접근', '무제한 퀴즈', '오디오북', '학습 통계']),
      stripe_price_id: 'price_monthly',
      billing_cycle: 'monthly',
    },
    {
      name: '연간 플랜',
      description: '1년 무제한 이용 (20% 할인)',
      price: 9504, // 월 792원 (20% 할인)
      duration_days: 365,
      features: JSON.stringify(['모든 도서 접근', '무제한 퀴즈', '오디오북', '학습 통계', 'AI 추천', '프리미엄 지원']),
      stripe_price_id: 'price_yearly',
      billing_cycle: 'annual',
    },
  ],

  coupons: [
    {
      code: 'WELCOME2025',
      discount_type: 'percentage',
      discount_value: 20,
      valid_from: new Date(),
      valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      max_uses: 1000,
      min_purchase_amount: 0,
    },
    {
      code: 'NEWYEAR50',
      discount_type: 'fixed',
      discount_value: 500,
      valid_from: new Date(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      max_uses: 100,
      min_purchase_amount: 1000,
    },
  ],
};

async function seedData() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting data seeding...\n');

    await client.query('BEGIN');

    // 1. Categories
    console.log('📚 Creating categories...');
    const categories = [];
    for (const cat of SAMPLE_DATA.categories) {
      const result = await client.query(
        `INSERT INTO categories (name, description)
         VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
         RETURNING id`,
        [cat.name, cat.description]
      );
      categories.push(result.rows[0].id);
    }
    console.log(`✅ Created ${categories.length} categories\n`);

    // 2. Subscription Plans
    console.log('💳 Creating subscription plans...');
    const plans = [];
    for (const plan of SAMPLE_DATA.subscriptionPlans) {
      const result = await client.query(
        `INSERT INTO subscription_plans (name, description, price, duration_days, features, stripe_price_id, billing_cycle, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         ON CONFLICT (stripe_price_id) DO UPDATE
         SET name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price
         RETURNING id`,
        [plan.name, plan.description, plan.price, plan.duration_days, plan.features, plan.stripe_price_id, plan.billing_cycle]
      );
      plans.push(result.rows[0].id);
    }
    console.log(`✅ Created ${plans.length} subscription plans\n`);

    // 3. Users
    console.log('👥 Creating users...');
    const users = [];
    for (const user of SAMPLE_DATA.users) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      const result = await client.query(
        `INSERT INTO users (email, password_hash, username, role, email_verified)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (email) DO UPDATE
         SET username = EXCLUDED.username, role = EXCLUDED.role
         RETURNING id`,
        [user.email, passwordHash, user.username, user.role]
      );
      const userId = result.rows[0].id;
      users.push(userId);

      // Create user profile
      await client.query(
        `INSERT INTO user_profiles (user_id, full_name, language_level, learning_goals)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO UPDATE
         SET full_name = EXCLUDED.full_name`,
        [userId, user.username, 'intermediate', JSON.stringify(['improve vocabulary', 'read classics'])]
      );
    }
    console.log(`✅ Created ${users.length} users\n`);

    // 4. Books
    console.log('📖 Creating books...');
    const books = [];
    for (let i = 0; i < SAMPLE_DATA.books.length; i++) {
      const book = SAMPLE_DATA.books[i];
      const categoryId = categories[Math.min(i, categories.length - 1)];

      const result = await client.query(
        `INSERT INTO books (title, author, description, difficulty, cover_image_url, category_id, target_audience, estimated_reading_time, is_published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
         ON CONFLICT (title, author) DO UPDATE
         SET description = EXCLUDED.description, difficulty = EXCLUDED.difficulty
         RETURNING id`,
        [book.title, book.author, book.description, book.difficulty, book.cover_image_url, categoryId, book.target_audience, book.estimated_reading_time]
      );
      books.push(result.rows[0].id);
    }
    console.log(`✅ Created ${books.length} books\n`);

    // 5. Chapters
    console.log('📄 Creating chapters...');
    let chapterCount = 0;
    for (const bookId of books) {
      for (const chapter of SAMPLE_DATA.chapters) {
        await client.query(
          `INSERT INTO chapters (book_id, title, chapter_number, content)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (book_id, chapter_number) DO UPDATE
           SET title = EXCLUDED.title`,
          [bookId, chapter.title, chapter.chapter_number, `This is sample content for ${chapter.title}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In a real scenario, this would contain the actual chapter text with proper formatting and content.`]
        );
        chapterCount++;
      }
    }
    console.log(`✅ Created ${chapterCount} chapters\n`);

    // 6. Coupons
    console.log('🎟️  Creating coupons...');
    for (const coupon of SAMPLE_DATA.coupons) {
      await client.query(
        `INSERT INTO coupons (code, discount_type, discount_value, valid_from, valid_until, max_uses, min_purchase_amount, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         ON CONFLICT (code) DO UPDATE
         SET discount_value = EXCLUDED.discount_value, valid_until = EXCLUDED.valid_until`,
        [coupon.code, coupon.discount_type, coupon.discount_value, coupon.valid_from, coupon.valid_until, coupon.max_uses, coupon.min_purchase_amount]
      );
    }
    console.log(`✅ Created ${SAMPLE_DATA.coupons.length} coupons\n`);

    // 7. Sample subscriptions for demo user
    console.log('📋 Creating sample subscription...');
    const demoUserId = users[users.length - 1]; // Last user (demo user)
    const monthlyPlanId = plans[1]; // Monthly plan

    await client.query(
      `INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date)
       VALUES ($1, $2, 'active', NOW(), NOW() + INTERVAL '30 days')
       ON CONFLICT DO NOTHING`,
      [demoUserId, monthlyPlanId]
    );
    console.log('✅ Created sample subscription\n');

    // 8. Sample learning progress
    console.log('📊 Creating sample learning progress...');
    const firstChapter = await client.query(
      'SELECT id FROM chapters WHERE book_id = $1 LIMIT 1',
      [books[0]]
    );

    if (firstChapter.rows.length > 0) {
      await client.query(
        `INSERT INTO learning_progress (user_id, chapter_id, progress_percentage, completed, last_position)
         VALUES ($1, $2, 45, false, 1250)
         ON CONFLICT (user_id, chapter_id) DO UPDATE
         SET progress_percentage = EXCLUDED.progress_percentage`,
        [demoUserId, firstChapter.rows[0].id]
      );
    }
    console.log('✅ Created sample learning progress\n');

    await client.query('COMMIT');

    console.log('🎉 Data seeding completed successfully!\n');
    console.log('📌 Demo Account Credentials:');
    console.log('   Email: demo@example.com');
    console.log('   Password: Demo1234!\n');
    console.log('📌 Admin Account Credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: Admin1234!\n');
    console.log('📌 Active Coupons:');
    SAMPLE_DATA.coupons.forEach(coupon => {
      console.log(`   Code: ${coupon.code} (${coupon.discount_type === 'percentage' ? coupon.discount_value + '%' : coupon.discount_value + '원'} off)`);
    });
    console.log('');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seeding
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('✅ Seeding script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding script failed:', error);
      process.exit(1);
    });
}

module.exports = { seedData };
