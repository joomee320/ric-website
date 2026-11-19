import { HomePage } from '@/components/pages/HomePage';
import { getContent } from '@/lib/cms/getContent';

export default async function Page() {
  const content = await getContent();
  return <HomePage content={content.home_page} />;
}
