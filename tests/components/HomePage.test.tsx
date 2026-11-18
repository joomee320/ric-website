import { expect, test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { HomePage } from '../../components/HomePage';

test('Content model: HomePage shows hero_title and the mission statement under "Mission"', () => {
  const out = renderToStaticMarkup(
    <HomePage content={{ hero_title: 'Rooted in Cambodia', mission_statement: 'We **heal**.\n\nWe learn.' }} />,
  );
  expect(out).toBe(
    '<main><h1>Rooted in Cambodia</h1><section><h2>Mission</h2>' +
      '<p>We <strong>heal</strong>.</p>\n<p>We learn.</p></section></main>',
  );
});
