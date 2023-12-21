import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="flex-center wrapper flex-between flex flex-col gap-4 p-5 text-center sm:flex-row">
        <Link href="/">
          {/* <Image
            src="/assets/images/logo.svg"
            alt="total-peanuts-logo"
            width={128}
            height={38}
          /> */}
          <h2 className="text-xl font-bold">Total Peanuts</h2>
        </Link>

        <p>2023 Total Peanuts. All Rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
