import Collection from '@/components/shared/Collection';
import { Button } from '@/components/ui/button';
import { getCoursesByUser } from '@/lib/actions/course.actions';
import { getOrdersByUser } from '@/lib/actions/order.actions';
import { IOrder } from '@/lib/database/models/order.model';
import { SearchParamProps } from '@/types';
import { auth } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react';

const ProfilePage = async ({ searchParams }: SearchParamProps) => {
  const { sessionClaims } = auth();
  const userId = sessionClaims?.userId as string;

  const ordersPage = Number(searchParams?.ordersPage) || 1;
  const coursesPage = Number(searchParams?.coursesPage) || 1;

  const orders = await getOrdersByUser({ userId, page: ordersPage });

  const orderedCourses =
    orders?.data.map((order: IOrder) => order.course) || [];

  const organizedCourses = await getCoursesByUser({
    userId,
    page: coursesPage,
  });

  return (
    <>
      {/* My Tickets */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">My Tickets</h3>
          <Button
            asChild
            size="lg"
            className="button hidden sm:flex"
          >
            <Link href="/#events">Explore More Courses</Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8">
        <Collection
          data={orderedCourses}
          emptyTitle="No course tickets purchased yet"
          emptyStateSubtext="No worries - plenty of exciting courses to explore!"
          collectionType="My_Tickets"
          limit={3}
          page={ordersPage}
          urlParamName="ordersPage"
          totalPages={orders?.totalPages}
        />
      </section>

      {/* Courses Organized */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-center sm:justify-between">
          <h3 className="h3-bold text-center sm:text-left">
            Courses Organized
          </h3>
          <Button
            asChild
            size="lg"
            className="button hidden sm:flex"
          >
            <Link href="/events/create">Create New Course</Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8">
        <Collection
          data={organizedCourses?.data}
          emptyTitle="No courses have been created yet"
          emptyStateSubtext="Go create some now"
          collectionType="Courses_Organized"
          limit={3}
          page={coursesPage}
          urlParamName="coursesPage"
          totalPages={organizedCourses?.totalPages}
        />
      </section>
    </>
  );
};

export default ProfilePage;
