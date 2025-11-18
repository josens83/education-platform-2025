/**
 * 유틸리티 함수 테스트
 *
 * 기본적인 유틸리티 함수들의 동작을 검증합니다.
 */

describe('String Utilities', () => {
  test('should validate email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 유효한 이메일
    expect(emailRegex.test('user@example.com')).toBe(true);
    expect(emailRegex.test('test.user@domain.co.kr')).toBe(true);

    // 유효하지 않은 이메일
    expect(emailRegex.test('invalid')).toBe(false);
    expect(emailRegex.test('@example.com')).toBe(false);
    expect(emailRegex.test('user@')).toBe(false);
  });

  test('should sanitize HTML special characters', () => {
    const sanitize = (str) => {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
      };
      return str.replace(/[&<>"'/]/g, (char) => map[char]);
    };

    expect(sanitize('<script>alert("XSS")</script>'))
      .toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');

    expect(sanitize('Hello & <World>'))
      .toBe('Hello &amp; &lt;World&gt;');
  });
});

describe('Number Utilities', () => {
  test('should round to 2 decimal places', () => {
    const round = (num) => Math.round(num * 100) / 100;

    expect(round(1.2345)).toBe(1.23);
    expect(round(1.9999)).toBe(2);
    expect(round(1.005)).toBe(1.01);
  });

  test('should calculate percentage', () => {
    const percentage = (part, whole) => {
      if (whole === 0) return 0;
      return Math.round((part / whole) * 100 * 100) / 100;
    };

    expect(percentage(25, 100)).toBe(25);
    expect(percentage(1, 3)).toBe(33.33);
    expect(percentage(0, 100)).toBe(0);
    expect(percentage(50, 0)).toBe(0);
  });
});

describe('Date Utilities', () => {
  test('should format date to ISO string', () => {
    const date = new Date('2025-01-18T00:00:00.000Z');
    expect(date.toISOString()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  test('should calculate days difference', () => {
    const daysDiff = (date1, date2) => {
      const diffTime = Math.abs(date2 - date1);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const date1 = new Date('2025-01-01');
    const date2 = new Date('2025-01-18');

    expect(daysDiff(date1, date2)).toBe(17);
  });
});

describe('Array Utilities', () => {
  test('should chunk array into smaller arrays', () => {
    const chunk = (arr, size) => {
      const result = [];
      for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
      }
      return result;
    };

    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    expect(chunk([], 2)).toEqual([]);
  });

  test('should remove duplicates from array', () => {
    const unique = (arr) => [...new Set(arr)];

    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    expect(unique([])).toEqual([]);
  });
});

describe('Object Utilities', () => {
  test('should pick properties from object', () => {
    const pick = (obj, keys) => {
      return keys.reduce((result, key) => {
        if (obj.hasOwnProperty(key)) {
          result[key] = obj[key];
        }
        return result;
      }, {});
    };

    const user = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      password: 'secret'
    };

    expect(pick(user, ['id', 'name', 'email'])).toEqual({
      id: 1,
      name: 'John',
      email: 'john@example.com'
    });
  });

  test('should omit properties from object', () => {
    const omit = (obj, keys) => {
      const result = { ...obj };
      keys.forEach(key => delete result[key]);
      return result;
    };

    const user = {
      id: 1,
      name: 'John',
      password: 'secret',
      token: 'abc123'
    };

    expect(omit(user, ['password', 'token'])).toEqual({
      id: 1,
      name: 'John'
    });
  });
});
