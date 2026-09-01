export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const origin = url.origin;

  if (path !== '/' && !path.endsWith('.html')) {
    return next();
  }

  const available = ['en', 'lt', 'ru'];
  const urlLang = (url.searchParams.get('lang') || '').toLowerCase();
  const acceptLang = (request.headers.get('accept-language') || 'lt')
    .split(',')[0].trim().slice(0, 2).toLowerCase();
  const lang = available.includes(urlLang) ? urlLang
             : available.includes(acceptLang) ? acceptLang : 'lt';

  const response = await next();

  const [dataRes, contactsRes] = await Promise.all([
    env.ASSETS.fetch(new URL(`/data/${lang}.json`, url)).catch(() => null),
    env.ASSETS.fetch(new URL('/data/contacts.json', url)).catch(() => null),
  ]);

  const data = dataRes?.ok ? await dataRes.json() : {};
  const contacts = contactsRes?.ok ? await contactsRes.json() : {};

  // FLAT KEY LOOKUP — your JSON uses "meta.title", not nested objects
  const get = (path) => data[path];

  const name = contacts.names?.[lang] || contacts.names?.lt || 'Vardas Pavardė';
  const year = new Date().getFullYear();

  const resolve = (path) => {
    let v = get(path);
    if (typeof v === 'string') {
      v = v.replaceAll('{name}', name).replaceAll('{year}', year.toString());
    }
    return v;
  };

  // phone_formatted stripped of + and spaces for links; kept as-is for display
  const phoneFormatted = contacts.phone_formatted?.toString().trim() || '';
  const phone = phoneFormatted.replace(/[+\s]/g, '');
  const phoneDisplay = phoneFormatted;

  const rewriter = new HTMLRewriter()
    .on('html', { element(el) { el.setAttribute('lang', lang); } })

    .on('meta[property="og:title"]', { element(el) {
      const v = resolve('meta.title'); if (v != null) el.setAttribute('content', v);
    }})
    .on('meta[property="og:description"]', { element(el) {
      const v = resolve('meta.description'); if (v != null) el.setAttribute('content', v);
    }})
    .on('meta[property="og:url"]', { element(el) {
      el.setAttribute('content', url.href);
    }})
    .on('meta[property="og:locale"]', { element(el) {
      el.setAttribute('content', lang === 'en' ? 'en_US' : lang === 'ru' ? 'ru_RU' : 'lt_LT');
    }})
    .on('meta[property="og:image"]', { element(el) {
      el.setAttribute('content', `${origin}/preview-image.jpg`);
    }})
    .on('meta[property="og:image:alt"]', { element(el) {
      const v = resolve('hero.alt'); if (v != null) el.setAttribute('content', v);
    }})

    .on('title', { element(el) {
      const v = resolve('meta.title'); if (v != null) el.setInnerContent(v);
    }})
    .on('meta[name="description"]', { element(el) {
      const v = resolve('meta.description'); if (v != null) el.setAttribute('content', v);
    }})
    .on('link[rel="canonical"]', { element(el) {
      el.setAttribute('href', url.href);
    }})
    .on('link[rel="alternate"]', { element(el) {
      const href = el.getAttribute('href');
      if (href && href.startsWith('/')) {
        el.setAttribute('href', origin + href);
      }
    }})

    .on('[data-i18n]', { element(el) {
      const v = resolve(el.getAttribute('data-i18n'));
      if (v != null) el.setInnerContent(v);
    }})
    .on('[data-i18n-alt]', { element(el) {
      const v = resolve(el.getAttribute('data-i18n-alt'));
      if (v != null) el.setAttribute('alt', v);
    }})

    .on('.lang-btn', { element(el) {
      el.setAttribute('aria-pressed', el.getAttribute('data-lang') === lang ? 'true' : 'false');
    }})

    .on('a[data-contact="phone"]', { element(el) {
      if (phone) el.setAttribute('href', `tel:+${phone}`);
    }})
    .on('a.phone-link', { element(el) {
      if (phoneDisplay) el.setInnerContent(phoneDisplay);
    }})
    .on('a[data-contact="email"]', { element(el) {
      if (contacts.email) el.setAttribute('href', `mailto:${contacts.email}`);
    }})
    .on('.email-link', { element(el) {
      if (contacts.email) el.setInnerContent(contacts.email);
    }})
    .on('a[data-contact="telegram"]', { element(el) {
      if (contacts.telegram) el.setAttribute('href', `https://t.me/${contacts.telegram}`);
      else if (phone) el.setAttribute('href', `tg://resolve?phone=${phone}`);
    }})
    .on('a[data-contact="whatsapp"]', { element(el) {
      if (phone) el.setAttribute('href', `https://wa.me/${phone}`);
    }})
    .on('a[data-contact="viber"]', { element(el) {
      if (phone) el.setAttribute('href', `viber://chat?number=%2B${phone}`);
    }})
    .on('a[data-contact]', { element(el) {
      const type = el.getAttribute('data-contact');
      const label = resolve(`contacts.${type}Label`);
      if (label) {
        el.setAttribute('aria-label', label);
        el.setAttribute('title', label);
      }
    }})

    .on('script[type="application/ld+json"]', { element(el) {
      const json = {
        "@context": "https://schema.org",
        "@type": "LegalService",
        "name": name,
        "image": `${origin}/preview-image.jpg`,
        "knowsLanguage": ["lt", "ru", "en"],
        "areaServed": { "@type": "Country", "name": "Lithuania" },
        "url": `${origin}/`,
        "telephone": phone ? `+${phone}` : '',
        "email": contacts.email || ''
      };
      el.setInnerContent(JSON.stringify(json, null, 2));
    }});

  return rewriter.transform(response);
}
