import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Section } from '@/components/ui/section';
import { ResumeDataSchemaType } from '@/lib/resume';

/**
 * Displays the education period in a consistent format
 */
function EducationPeriod({ start, end }: { start: string; end: string }) {
  return (
    <div
      className="text-sm tabular-nums text-gray-500"
      aria-label={`Period: ${start} to ${end}`}
    >
      {start} - {end}
    </div>
  );
}

/**
 * Individual education card component
 */
function EducationItem({
  education,
}: {
  education: ResumeDataSchemaType['education'][0];
}) {
  const { school, start, end, degree } = education;

  // Skip rendering if required fields are missing
  if (!school || !degree || !start) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-base">
          <h3
            className="font-semibold leading-none"
            id={`education-${school.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {school}
          </h3>
          <EducationPeriod start={start} end={end} />
        </div>
      </CardHeader>
      <CardContent
        className="mt-2 text-design-resume print:text-[12px]"
        aria-labelledby={`education-${school
          .toLowerCase()
          .replace(/\s+/g, '-')}`}
      >
        {degree}
      </CardContent>
    </Card>
  );
}

/**
 * Main education section component
 * Renders a list of education experiences
 */
export function Education({
  educations,
}: {
  educations: ResumeDataSchemaType['education'];
}) {
  // Filter out invalid education entries
  const validEducations = educations.filter(
    (edu) => edu.school && edu.degree && edu.start
  );

  if (validEducations.length === 0) {
    return null;
  }

  return (
    <Section>
      <h2 className="text-xl font-bold" id="education-section">
        Education
      </h2>
      <div
        className="space-y-4"
        role="feed"
        aria-labelledby="education-section"
      >
        {validEducations.map((item, idx) => (
          <article key={idx} role="article">
            <EducationItem education={item} />
          </article>
        ))}
      </div>
    </Section>
  );
}
