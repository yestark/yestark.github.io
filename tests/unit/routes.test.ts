import { describe, expect, it } from 'vitest';
import { entryPath, localizedPath } from '../../src/lib/routes';

describe('localizedPath', () => {
  it('uses root routes for Chinese and /en routes for English', () => {
    expect(localizedPath('home', 'zh')).toBe('/');
    expect(localizedPath('about', 'zh')).toBe('/about/');
    expect(localizedPath('about', 'en')).toBe('/en/about/');
    expect(localizedPath('articles', 'zh')).toBe('/articles/');
    expect(localizedPath('archive', 'en')).toBe('/en/archive/');
  });
});

describe('entryPath', () => {
  it('places English entries below /en and Chinese entries at root', () => {
    expect(entryPath('articles', { id: 'hello', data: { language: 'zh' } })).toBe('/articles/hello/');
    expect(entryPath('projects', { id: 'agent-lab', data: { language: 'en' } })).toBe('/en/projects/agent-lab/');
  });
});
