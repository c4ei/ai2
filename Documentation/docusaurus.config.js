// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'The AiC4EI Docs',
  tagline: 'Use ChatGPT completely free and anonymously, what are you waiting for to be able to chat with the most philosophical conversations and questions about your existence?',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  // url: 'https://lovelace.rodyherrera.com',
  url: 'https://ai.c4ei.net',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'rodyherrera', // Usually your GitHub org/user name.
  projectName: 'AiC4EI', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: false
      },
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'AiC4EI Docs',
        logo: {
          alt: 'AiC4EI Logo',
          src: 'img/logo.png',
        },
        items: [
          {
            href: 'https://github.com/xtekky/gpt4free',
            label: 'GPT4FREE Python',
            position: 'left'
          },
          {
            href: 'https://lovelace.rodyherrera.com',
            label: "AiC4EI's Website",
            position: 'right'
          },
          {
            href: 'https://ko-fi.com/rodyherrera',
            label: 'Donate / Contribute',
            position: 'right'
          },
          {
            href: 'https://github.com/rodyherrera/Lovelace/',
            label: 'GitHub Repository',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} 2023 AiC4EI AI.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
