import { describe, expect, it } from 'vitest';
import { entryPath, localizedPath } from '../../src/lib/routes';

describe('localizedPath', () => {
  it('uses root routes for Chinese and /en routes for English', () => {
    expect(localizedPath('home', 'zh')).toBe('/');
    expect(localizedPath('about', 'zh')).toBe('/about/');
    expect(localizedPath('about', 'en')).toBe('/en/about/');
    expect(localizedPath('thoughts', 'en')).toBe('/en/thoughts/');
  });
});

describe('entryPath', () => {
  it('places English entries below /en and Chinese entries at root', () => {
    expect(entryPath('thoughts', { id: 'hello', data: { language: 'zh' } })).toBe('/thoughts/hello/');
    expect(entryPath('projects', { id: 'agent-lab', data: { language: 'en' } })).toBe('/en/projects/agent-lab/');
  });
});
