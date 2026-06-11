import { renderMarkdown } from "./markdown";

type Props = {
  markdown: string;
};

export function BriefMarkdown({ markdown }: Props) {
  return (
    <div
      className="prose-rec space-y-3 text-[15px] leading-relaxed text-gray-700 dark:text-gray-200
        [&>h3]:text-xl [&>h3]:mt-6 [&>h4]:text-lg [&>h4]:mt-5
        [&_p]:text-gray-600 [&_p]:dark:text-gray-300 [&_li]:text-gray-600 [&_li]:dark:text-gray-300
        [&_strong]:text-gray-900 [&_strong]:dark:text-white [&_strong]:font-semibold"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
    />
  );
}
