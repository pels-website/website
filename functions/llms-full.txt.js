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

- **Name**: ${name}
- **Specialization**: Criminal Law & Defense
- **Practice Area**: Lithuania
- **Experience**: 45+ years
- **Languages**: Lithuanian, English, Russian
- **Phone**: ${contacts.phone_formatted || ''}
- **Email**: ${contacts.email || ''}

## About

${r('about.intro')}

### Key Points

- **${r('about.b1_title')}** ${r('about.b1_text')}
- **${r('about.b2_title')}** ${r('about.b2_text')}
- **${r('about.b3_title')}** ${r('about.b3_text')}

## Consultation

${r('contacts.intro1')}
${r('contacts.intro2')}

- **${r('consult_in_person_title')}**: ${r('consult_in_person_desc')}
- **${r('consult_online_title')}**: ${r('consult_online_desc')}
- **${r('contacts.workplace')}**

## Resources

- [Main Page](${origin}/)
- [Contact JSON](${origin}/data/contacts.json)
- [Lithuanian Content](${origin}/data/lt.json)
- [English Content](${origin}/data/en.json)
- [Russian Content](${origin}/data/ru.json)
`;

  return new Response(body, {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  });
}
