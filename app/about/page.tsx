// /about — STUB route (docs/decisions.md D9, D12). Thin connector only:
// TODO: call getContent() and pass content.about_us once the section exists.
import { AboutPage } from '@/components/AboutPage';

export default function Page() {
  return <AboutPage />;
}
