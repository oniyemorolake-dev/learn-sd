import { courseDisplayName } from '../lib/content.js';

export default function CourseLabel({ course }) {
  if (!course) return null;
  return (
    <div className="course-identity">
      <div className="course-identity-name">{courseDisplayName(course)}</div>
      <div className="course-identity-code">{course.code}</div>
    </div>
  );
}
