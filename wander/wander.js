const wander = {
  consoles: [
    'https://susam.net/wander/',
  ],
  pages: [
    'https://boingboing.net/',
    'https://www.swiss-miss.com/',
    'https://waxy.org/',
    'https://le-chouchou.ghost.io/',
    'https://osolnacabeca.com.br/',
    'https://ellesho.me/page/website/now/',
    'https://a-website-is-a-room.net/'
  ],
  // Websites and consoles to ignore.  When this console serves as
  // your host console, it will never contact consoles or recommend
  // web pages with addresses that match the following regular
  // expression patterns.
  ignore: [
    // Off-topic since these are commercial services, not personal websites.
    '.*://medium\\.com/.*',
    '.*://.*\\.substack\\.com/.*',

    // These do not load in the console due to frame-embedding restrictions.
    '.*://cari\\.institute/.*',
    '.*://wdl\\.mcdaniel\\.edu/.*',
  ]
}
