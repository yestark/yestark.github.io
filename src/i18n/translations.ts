import type { Language, StaticPage } from './types';

type Dictionary = {
  locale: string;
  nav: Record<StaticPage, string>;
  hero: { status: string; intro: string; title: string; body: string; thoughtsCta: string; aboutCta: string };
  thoughts: { eyebrow: string; title: string; emptyTitle: string; emptyBody: string; all: string };
  projects: { eyebrow: string; title: string; emptyTitle: string; emptyBody: string; all: string };
  contact: { eyebrow: string; title: string; body: string; email: string; copy: string; copied: string; copyFailed: string };
  about: { eyebrow: string; title: string; body: string; link: string };
  footer: string;
};

export const translations: Record<Language, Dictionary> = {
  zh: {
    locale: 'zh-CN',
    nav: { home: '首页', about: '关于', thoughts: '想法', projects: '项目', contact: '联系' },
    hero: {
      status: '开放合作',
      intro: 'Hi, I’m Stark Ye.',
      title: 'I build useful AI experiences, end to end.',
      body: '关注 AI 与全栈产品，把新技术变成可用、可信、能够进入真实工作流的产品，也记录其中的判断与思考。',
      thoughtsCta: '阅读我的想法',
      aboutCta: '了解我',
    },
    thoughts: { eyebrow: 'Thoughts', title: '最近的想法', emptyTitle: '文章正在写作中', emptyBody: '这里将记录关于 AI、软件与个人思考的内容。', all: '查看全部' },
    projects: { eyebrow: 'Projects', title: '项目档案', emptyTitle: '正在整理代表项目', emptyBody: '真实案例准备完成后会在这里发布。', all: '查看项目' },
    contact: { eyebrow: 'Contact', title: '有值得一起构建的想法？', body: '欢迎围绕 AI、全栈产品或长期合作联系我。', email: '发邮件', copy: '复制邮箱', copied: '邮箱已复制', copyFailed: '请手动复制邮箱地址' },
    about: { eyebrow: 'About Stark Ye', title: '在技术能力和产品判断之间，做真正有用的东西。', body: 'AI 与全栈产品构建者，关注技术如何进入真实工作流。', link: '更多关于我' },
    footer: 'Built with intention',
  },
  en: {
    locale: 'en',
    nav: { home: 'Home', about: 'About', thoughts: 'Thoughts', projects: 'Projects', contact: 'Contact' },
    hero: {
      status: 'Open to collaborate',
      intro: 'Hi, I’m Stark Ye.',
      title: 'I build useful AI experiences, end to end.',
      body: 'I turn emerging technology into useful, dependable products that fit real workflows—and write about the judgment behind the work.',
      thoughtsCta: 'Read my thoughts',
      aboutCta: 'About me',
    },
    thoughts: { eyebrow: 'Thoughts', title: 'Recent thoughts', emptyTitle: 'Notes in progress', emptyBody: 'Writing about AI, software, and ideas worth keeping.', all: 'View all' },
    projects: { eyebrow: 'Projects', title: 'Selected work', emptyTitle: 'Case studies in progress', emptyBody: 'Real project stories will appear here when they are ready.', all: 'View projects' },
    contact: { eyebrow: 'Contact', title: 'Have something worth building together?', body: 'Reach out about AI, full-stack products, or long-term collaboration.', email: 'Send email', copy: 'Copy email', copied: 'Email copied', copyFailed: 'Please copy the address manually' },
    about: { eyebrow: 'About Stark Ye', title: 'Building useful things where engineering meets product judgment.', body: 'An AI and full-stack product builder focused on technology that fits real workflows.', link: 'More about me' },
    footer: 'Built with intention',
  },
};
