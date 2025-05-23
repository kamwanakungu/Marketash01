/*
  # Add Wallet and Chat System

  1. New Tables
    - `wallets`: Stores user wallet information
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `balance` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `chat_rooms`: Stores chat sessions between users
      - `id` (uuid, primary key)
      - `buyer_id` (uuid, references profiles)
      - `seller_id` (uuid, references profiles)
      - `product_id` (uuid, references products)
      - `created_at` (timestamp)
    
    - `messages`: Stores chat messages
      - `id` (uuid, primary key)
      - `room_id` (uuid, references chat_rooms)
      - `sender_id` (uuid, references profiles)
      - `content` (text)
      - `read` (boolean)
      - `created_at` (timestamp)

    - `credit_applications`: Stores BNPL applications
      - `id` (uuid, primary key)
      - `farmer_id` (uuid, references profiles)
      - `amount` (numeric)
      - `purpose` (text)
      - `status` (text)
      - `approved_by` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for wallet access
    - Add policies for chat access
    - Add policies for credit applications
*/

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  balance numeric DEFAULT 0 CHECK (balance >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet"
  ON wallets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES profiles(id) NOT NULL,
  seller_id uuid REFERENCES profiles(id) NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their chat rooms"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) NOT NULL,
  sender_id uuid REFERENCES profiles(id) NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their chat rooms"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE id = room_id
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

-- Create credit_applications table
CREATE TABLE IF NOT EXISTS credit_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES profiles(id) NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  purpose text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE credit_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view their own applications"
  ON credit_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = farmer_id);

-- Add credit_score to profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'credit_score'
  ) THEN
    ALTER TABLE profiles ADD COLUMN credit_score integer DEFAULT 500 CHECK (credit_score >= 0 AND credit_score <= 1000);
  END IF;
END $$;

-- Add online status to profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_online'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_online boolean DEFAULT false;
  END IF;
END $$;