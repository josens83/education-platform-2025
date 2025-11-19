/**
 * Global Search Routes
 *
 * Unified search across Books, Chapters, and Notes
 * Premium search experience with fuzzy matching and relevance scoring
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../lib/db');

/**
 * Global Search
 * GET /api/search?q=query&type=all|books|chapters|notes&limit=20
 *
 * Features:
 * - Fuzzy text search using PostgreSQL full-text search
 * - Relevance scoring with ts_rank
 * - Cross-entity search (books, chapters, notes)
 * - Permission-aware (user-specific notes)
 * - Fast performance with GIN indexes
 */
router.get('/', auth, async (req, res) => {
  try {
    const { q: query, type = 'all', limit = 20 } = req.query;
    const userId = req.user.id;

    // Validate query
    if (!query || query.trim().length < 2) {
      return res.json({
        status: 'success',
        results: {
          books: [],
          chapters: [],
          notes: [],
        },
        total: 0,
      });
    }

    const searchTerm = query.trim();
    const searchLimit = Math.min(parseInt(limit) || 20, 100); // Max 100 results

    // Prepare full-text search query (PostgreSQL tsquery format)
    // Convert spaces to &amp; for AND logic (e.g., "harry potter" → "harry & potter")
    const tsQuery = searchTerm
      .split(/\s+/)
      .filter(Boolean)
      .join(' & ');

    const results = {
      books: [],
      chapters: [],
      notes: [],
    };

    // Search Books
    if (type === 'all' || type === 'books') {
      const booksQuery = `
        SELECT
          id,
          title,
          author,
          description,
          level,
          image_url,
          ts_rank(
            to_tsvector('english', coalesce(title, '') || ' ' || coalesce(author, '') || ' ' || coalesce(description, '')),
            to_tsquery('english', $1)
          ) as relevance
        FROM books
        WHERE to_tsvector('english', coalesce(title, '') || ' ' || coalesce(author, '') || ' ' || coalesce(description, ''))
          @@ to_tsquery('english', $1)
        ORDER BY relevance DESC, title ASC
        LIMIT $2
      `;

      const booksResult = await pool.query(booksQuery, [tsQuery, searchLimit]);
      results.books = booksResult.rows.map(row => ({
        id: row.id,
        type: 'book',
        title: row.title,
        subtitle: row.author,
        description: row.description,
        level: row.level,
        imageUrl: row.image_url,
        relevance: parseFloat(row.relevance),
        url: `/books/${row.id}`,
      }));
    }

    // Search Chapters
    if (type === 'all' || type === 'chapters') {
      const chaptersQuery = `
        SELECT
          c.id,
          c.title,
          c.chapter_number,
          c.content,
          b.id as book_id,
          b.title as book_title,
          ts_rank(
            to_tsvector('english', coalesce(c.title, '') || ' ' || coalesce(c.content, '')),
            to_tsquery('english', $1)
          ) as relevance
        FROM chapters c
        JOIN books b ON c.book_id = b.id
        WHERE to_tsvector('english', coalesce(c.title, '') || ' ' || coalesce(c.content, ''))
          @@ to_tsquery('english', $1)
        ORDER BY relevance DESC, c.chapter_number ASC
        LIMIT $2
      `;

      const chaptersResult = await pool.query(chaptersQuery, [tsQuery, searchLimit]);
      results.chapters = chaptersResult.rows.map(row => ({
        id: row.id,
        type: 'chapter',
        title: row.title,
        subtitle: `${row.book_title} - Chapter ${row.chapter_number}`,
        description: row.content ? row.content.substring(0, 200) + '...' : '',
        bookId: row.book_id,
        chapterNumber: row.chapter_number,
        relevance: parseFloat(row.relevance),
        url: `/books/${row.book_id}/chapters/${row.id}`,
      }));
    }

    // Search Notes (user-specific)
    if (type === 'all' || type === 'notes') {
      const notesQuery = `
        SELECT
          n.id,
          n.content,
          n.created_at,
          c.id as chapter_id,
          c.title as chapter_title,
          c.chapter_number,
          b.id as book_id,
          b.title as book_title,
          ts_rank(
            to_tsvector('english', coalesce(n.content, '')),
            to_tsquery('english', $1)
          ) as relevance
        FROM notes n
        JOIN chapters c ON n.chapter_id = c.id
        JOIN books b ON c.book_id = b.id
        WHERE n.user_id = $2
          AND to_tsvector('english', coalesce(n.content, ''))
          @@ to_tsquery('english', $1)
        ORDER BY relevance DESC, n.created_at DESC
        LIMIT $3
      `;

      const notesResult = await pool.query(notesQuery, [tsQuery, userId, searchLimit]);
      results.notes = notesResult.rows.map(row => ({
        id: row.id,
        type: 'note',
        title: `Note in ${row.chapter_title}`,
        subtitle: `${row.book_title} - Chapter ${row.chapter_number}`,
        description: row.content.substring(0, 200) + (row.content.length > 200 ? '...' : ''),
        bookId: row.book_id,
        chapterId: row.chapter_id,
        createdAt: row.created_at,
        relevance: parseFloat(row.relevance),
        url: `/books/${row.book_id}/chapters/${row.chapter_id}`,
      }));
    }

    // Calculate total
    const total = results.books.length + results.chapters.length + results.notes.length;

    res.json({
      status: 'success',
      query: searchTerm,
      results,
      total,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      status: 'error',
      message: '검색 중 오류가 발생했습니다',
    });
  }
});

/**
 * Search Suggestions / Autocomplete
 * GET /api/search/suggestions?q=query&limit=5
 *
 * Returns quick suggestions for autocomplete
 */
router.get('/suggestions', auth, async (req, res) => {
  try {
    const { q: query, limit = 5 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        status: 'success',
        suggestions: [],
      });
    }

    const searchTerm = query.trim();
    const searchLimit = Math.min(parseInt(limit) || 5, 20);

    // Get book titles and author names for autocomplete
    const suggestionsQuery = `
      SELECT DISTINCT
        title as suggestion,
        'book' as type,
        1 as priority
      FROM books
      WHERE title ILIKE $1
      UNION ALL
      SELECT DISTINCT
        author as suggestion,
        'author' as type,
        2 as priority
      FROM books
      WHERE author ILIKE $1
      ORDER BY priority ASC, suggestion ASC
      LIMIT $2
    `;

    const result = await pool.query(suggestionsQuery, [`%${searchTerm}%`, searchLimit]);

    res.json({
      status: 'success',
      suggestions: result.rows,
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      status: 'error',
      message: '자동완성 중 오류가 발생했습니다',
    });
  }
});

/**
 * Popular Searches
 * GET /api/search/popular
 *
 * Returns popular/trending search terms
 */
router.get('/popular', async (req, res) => {
  try {
    // For now, return static popular searches
    // In production, this could be calculated from search logs
    const popularSearches = [
      { term: 'Harry Potter', count: 150 },
      { term: 'The Great Gatsby', count: 120 },
      { term: 'Shakespeare', count: 95 },
      { term: 'Grammar', count: 80 },
      { term: 'Business English', count: 70 },
    ];

    res.json({
      status: 'success',
      popular: popularSearches,
    });
  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({
      status: 'error',
      message: '인기 검색어 조회 중 오류가 발생했습니다',
    });
  }
});

/**
 * Recent Searches
 * GET /api/search/recent
 *
 * Returns user's recent searches
 * (Requires search history tracking implementation)
 */
router.get('/recent', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: Implement search history table and tracking
    // For now, return empty array
    const recentSearches = [];

    res.json({
      status: 'success',
      recent: recentSearches,
    });
  } catch (error) {
    console.error('Recent searches error:', error);
    res.status(500).json({
      status: 'error',
      message: '최근 검색어 조회 중 오류가 발생했습니다',
    });
  }
});

module.exports = router;
