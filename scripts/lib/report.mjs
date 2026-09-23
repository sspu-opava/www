import { mkdir, writeFile, appendFile } from 'node:fs/promises';
export async function report(name, title, issues, details = {}) {
  issues.sort((a, b) => ({ error: 0, warning: 1, info: 2 }[a.level] - { error: 0, warning: 1, info: 2 }[b.level]));
  await mkdir('reports', { recursive: true });
  const counts = { error: 0, warning: 0, info: 0 };
  issues.forEach(issue => { counts[issue.level] += 1; });
  const markdown = '# ' + title + '\n\n' + counts.error + ' chyb · ' + counts.warning + ' upozornění · ' + counts.info + ' informací\n\n'
    + Object.entries(details).map(([key, value]) => '- ' + key + ': ' + value).join('\n') + '\n\n'
    + (issues.length ? issues.map(issue => '- **' + issue.level + '** · ' + (issue.file || '') + ' · ' + issue.message.replaceAll('\n', ' ')).join('\n') : 'Kontroly prošly bez nálezů.') + '\n';
  await writeFile('reports/' + name + '.json', JSON.stringify({ title, counts, details, issues }, null, 2));
  await writeFile('reports/' + name + '.md', markdown);
  console.log(title + ': ' + counts.error + ' chyb, ' + counts.warning + ' upozornění. Podrobnosti: reports/' + name + '.md');
  for (const issue of issues.filter(i => i.level === 'error').slice(0, 40)) {
    console.error((issue.file || '') + ': ' + issue.message);
    if (process.env.GITHUB_ACTIONS) console.error('::error' + (issue.file ? ' file=' + issue.file : '') + '::' + issue.message.replaceAll('%', '%25').replaceAll('\n', '%0A').replaceAll('\r', '%0D'));
  }
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown.slice(0, 50000));
  if (counts.error) process.exitCode = 1;
  return counts;
}
