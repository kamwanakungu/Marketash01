import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';

const bidSchema = z.object({
  amount: z.number().positive('Bid amount must be positive'),
});

type BidFormData = z.infer<typeof bidSchema>;

interface Product {
  id: string;
  title: string;
  base_price: number;
  description: string;
  image: string;
  user_id: string;
}

interface Bid {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  user_id: string;
}

export function BiddingSystem({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<BidFormData>({
    resolver: zodResolver(bidSchema)
  });

  useEffect(() => {
    fetchProduct();
    fetchBids();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    }
  };

  const fetchBids = async () => {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('product_id', productId)
        .order('amount', { ascending: false });

      if (error) throw error;
      setBids(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bids');
    }
  };

  const onSubmit = async (data: BidFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!product) {
        throw new Error('Product not found');
      }

      // Check if the bid amount is higher than the base price and any existing bids
      const highestBid = bids[0]?.amount || product.base_price;
      if (data.amount <= highestBid) {
        throw new Error(`Bid must be higher than ${highestBid}`);
      }

      const { error: bidError } = await supabase
        .from('bids')
        .insert({
          product_id: productId,
          user_id: user.id,
          amount: data.amount,
          status: 'pending'
        });

      if (bidError) throw bidError;

      // Refresh bids after successful submission
      await fetchBids();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bid');
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) {
    return <div>Loading product...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{product.title}</h2>
        <p className="text-gray-600">{product.description}</p>
        <p className="text-lg font-semibold mt-2">Base Price: ${product.base_price}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Current Bids</h3>
        {bids.length > 0 ? (
          <ul className="space-y-2">
            {bids.map((bid) => (
              <li key={bid.id} className="p-3 bg-gray-50 rounded-md">
                <span className="font-medium">${bid.amount}</span>
                <span className="ml-2 text-sm text-gray-500">
                  ({new Date(bid.created_at).toLocaleDateString()})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No bids yet</p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Your Bid Amount</label>
          <input
            type="number"
            step="0.01"
            {...register('amount', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Placing Bid...' : 'Place Bid'}
        </button>
      </form>
    </div>
  );
}