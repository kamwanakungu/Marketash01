/*
  # Initial Schema Setup

  1. New Tables
    - `products`: Stores product listings
    - `bids`: Stores bids on products
    - `profiles`: Stores user profiles
    - `crop_diagnosis`: Stores disease detection results
    - `notifications`: Stores user notifications

  2. Security
    - Enable RLS on all tables
    - Add appropriate access policies
*/

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  image text NOT NULL,
  base_price numeric NOT NULL CHECK (base_price > 0),
  unit text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  location text NOT NULL,
  harvest_date timestamptz,
  category text NOT NULL,
  status text DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  USING (status = 'available');

CREATE POLICY "Users can create their own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create bids table if it doesn't exist
CREATE TABLE IF NOT EXISTS bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status text DEFAULT 'pending',
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bids on their products"
  ON bids FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM products WHERE id = product_id
    ) OR auth.uid() = user_id
  );

CREATE POLICY "Users can create bids"
  ON bids FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  display_name text,
  avatar_url text,
  location text,
  credit_score integer DEFAULT 500 CHECK (credit_score >= 0 AND credit_score <= 1000),
  user_type text,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_online boolean DEFAULT false
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create crop_diagnosis table if it doesn't exist
CREATE TABLE IF NOT EXISTS crop_diagnosis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  image_url text NOT NULL,
  crop_type text NOT NULL,
  diagnosis text NOT NULL,
  confidence_score numeric NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  recommendation text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crop_diagnosis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own diagnoses"
  ON crop_diagnosis FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create diagnoses"
  ON crop_diagnosis FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  read boolean DEFAULT false,
  data jsonb,
  reference_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);