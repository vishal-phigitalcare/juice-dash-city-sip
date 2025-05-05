
-- Create a function to handle order creation
CREATE OR REPLACE FUNCTION create_order(
  p_user_id UUID,
  p_total_amount DECIMAL,
  p_order_type TEXT,
  p_address_id UUID DEFAULT NULL,
  p_table_no TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
BEGIN
  -- Insert the order and return the ID
  INSERT INTO orders (
    user_id,
    total_amount,
    order_type,
    status,
    address_id,
    table_no
  ) VALUES (
    p_user_id,
    p_total_amount,
    p_order_type,
    'placed',
    p_address_id,
    p_table_no
  )
  RETURNING id INTO v_order_id;
  
  RETURN v_order_id;
END;
$$;
