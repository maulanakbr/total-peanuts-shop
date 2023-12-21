import CourseForm from '@/components/shared/CourseForm';
import { getCourseById } from '@/lib/actions/course.actions';
import { auth } from '@clerk/nextjs';

type UpdateCourseProps = {
  params: {
    id: string;
  };
};

const UpdateCourse = async ({ params: { id } }: UpdateCourseProps) => {
  const { sessionClaims } = auth();

  const userId = sessionClaims?.userId as string;
  const course = await getCourseById(id);

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">
          Update Event
        </h3>
      </section>

      <div className="wrapper my-8">
        <CourseForm
          type="Update"
          course={course}
          courseId={course._id}
          userId={userId}
        />
      </div>
    </>
  );
};

export default UpdateCourse;
