// Some older vault notes are written in Russian; tag them so browsers,
// screen readers and translators handle them correctly.
export function noteLang(entry: { body?: string }): 'en' | 'ru' {
  const body = entry.body ?? '';
  const cyrillic = body.match(/[Ѐ-ӿ]/g)?.length ?? 0;
  const latin = body.match(/[A-Za-z]/g)?.length ?? 0;
  return cyrillic > latin ? 'ru' : 'en';
}
