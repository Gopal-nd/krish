
'use client'
import { FC } from 'react';
import { ArrowBigLeft, ShoppingCart, Store } from 'lucide-react';  // Import Lucide icons
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const Marketplace: FC = () => {
  const router = useRouter();
  return (
    <>
      <Button className='' onClick={() => router.back()}><ArrowBigLeft /></Button>
    <div className="min-h-[80vh] flex flex-col items-center justify-evenly  py-6">
      {/* Heading */}

      <h1 className="text-4xl font-bold ">Welcome Back to the Market Place</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl px-4">
        {/* Sell Products Section */}
        <Link href={'/dashboard/marketplace/list'} className="p-10 border rounded-lg text-center shadow-lg cursor-pointer hover:shadow-2xl transition-shadow">
          <Store className="mx-auto mb-4" size={48} />  {/* Store Icon for Sell */}
          <h2 className="text-3xl font-bold mb-4">Sell Products</h2>
          <p className="text-lg">
            List your items for sale, add details like name, description, and price.
          </p>
        </Link>

        {/* Buy Products Section */}
        <Link href={'/dashboard/marketplace/buy'} className="p-10 border rounded-lg text-center shadow-lg cursor-pointer hover:shadow-2xl transition-shadow">
          <ShoppingCart className="mx-auto mb-4" size={48} />  {/* ShoppingCart Icon for Buy */}
          <h2 className="text-3xl font-bold mb-4">Buy Products</h2>
          <p className="text-lg">
            Browse items for sale and find what you need with ease.
          </p>
        </Link>
      </div>
    </div>
    </>
  );
};

export default Marketplace;
