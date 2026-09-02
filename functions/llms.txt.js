export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const origin = url.origin;
  const lang = url.searchParams.get('lang') || 'lt';

  const [dataRes, contactsRes] = await Promise.all([
    env.ASSETS.fetch(new URL(`/data/${lang}.json`, url)).catch(() => null),
    env.ASSETS.fetch(new URL('/data/contacts.json', url)).catch(() => null),
  ]);

  const data = dataRes?.ok ? await dataRes.json() : {};
  const contacts = contactsRes?.ok ? await contactsRes.json() : {};
  const name = contacts.names?.[lang] || contacts.names?.lt || '';

  const r = (k) => (data[k] || '').replaceAll('{name}', name);

  const body = `# ${r('meta.title')}

> ${r('meta.description')}

## Overview

- **Specialization**: Criminal Law & Defense
- **Practice Area**: Lithuania (in-person in Vilnius and nationwide; remote worldwide)
- **Experience**: 45+ years
- **Languages**: Lithuanian (lt), English (en), Russian (ru)
- **Consultation Formats**: Free initial phone evaluation (up to 15 min), in-person meetings, online/video (Zoom, WhatsApp, Viber, Telegram)

## Core Resources

- [Main Page](${origin}/): Bio, services, and direct contact links.
- [Contact Details](${origin}/data/contacts.json): Phone, email, and messaging identifiers.

## Localization Files

- [Lithuanian](${origin}/data/lt.json)
- [English](${origin}/data/en.json)
- [Russian](${origin}/data/ru.json)
`;

  return new Response(body, {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  });
}
