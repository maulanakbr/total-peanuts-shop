'use client';

import { ICourse } from '@/lib/database/models/course.model';
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';
import Checkout from './Checkout';

const CheckoutButton = ({ course }: { course: ICourse }) => {
  const { user } = useUser();
  const userId = user?.publicMetadata.userId as string;
  const hasCourseFinished = new Date(course.endDateTime) < new Date();

  return (
    <div className="flex items-center gap-3">
      {hasCourseFinished ? (
        <p className="p-2 text-red-400">
          Sorry, tickets are no longer available.
        </p>
      ) : (
        <>
          <SignedOut>
            <Button
              asChild
              className="button rounded-full"
              size="lg"
            >
              <Link href="/sign-in">Get Tickets</Link>
            </Button>
          </SignedOut>

          <SignedIn>
            <Checkout
              course={course}
              userId={userId}
            />
          </SignedIn>
        </>
      )}
    </div>
  );
};

export default CheckoutButton;
