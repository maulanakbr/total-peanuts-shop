import React, { useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

import { ICourse } from '@/lib/database/models/course.model';
import { Button } from '../ui/button';
import { checkoutOrder } from '@/lib/actions/order.actions';

loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Checkout = ({ course, userId }: { course: ICourse; userId: string }) => {
  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      console.log('Order placed! You will receive an email confirmation.');
    }

    if (query.get('canceled')) {
      console.log(
        'Order canceled -- continue to shop around and checkout when you’re ready.'
      );
    }
  }, []);

  const onCheckout = async () => {
    const order = {
      courseTitle: course.title,
      courseId: course._id,
      price: course.price,
      isFree: course.isFree,
      buyerId: userId,
    };

    await checkoutOrder(order);
  };

  return (
    <form
      action={onCheckout}
      method="post"
    >
      <Button
        type="submit"
        role="link"
        size="lg"
        className="button sm:w-fit"
      >
        {course.isFree ? 'Get Ticket' : 'Buy Ticket'}
      </Button>
    </form>
  );
};

export default Checkout;
