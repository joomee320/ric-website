// /faq — STUB route (docs/decisions.md D9, D12). Thin connector only:
// TODO: call getContent() and pass content.faq_list once the section exists.
import { FaqPage } from '@/components/pages/FaqPage';

export default function Page() {
  return <FaqPage />;
}
