import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Funktionstyp für Spaltenüberprüfung
 */
type ColumnStatus = 'exists' | 'error' | 'unknown';

/**
 * Erkennt die Struktur der orders-Tabelle
 */
export async function detectOrdersTableColumns(supabase: SupabaseClient): Promise<{
  columnsStatus: Record<string, ColumnStatus>;
  detectedColumns: string[];
  schemaType: 'json' | 'columnar' | 'mixed' | 'minimal' | 'unknown';
}> {
  console.log('Detecting orders table column structure...');
  
  // Mögliche Spaltennamen in der Tabelle
  const possibleColumns = [
    'id', 
    'user_id', 
    'data',
    'order_data',
    'order_json',
    'items',
    'items_json',
    'subtotal',
    'tax',
    'shipping',
    'shipping_fee',
    'total',
    'payment_method',
    'delivery_method',
    'status',
    'shipping_address',
    'shipping_address_json',
    'shipping_address_id',
    'billing_address_id',
    'pickup_location',
    'created_at',
    'updated_at'
  ];
  
  const columnsStatus: Record<string, ColumnStatus> = {};
  
  // Teste jede mögliche Spalte
  for (const column of possibleColumns) {
    try {
      // Wir verwenden einen Timeout, damit ein langsamer Server nicht den Prozess blockiert
      const timeoutPromise = new Promise<{ error: Error }>((_, reject) => 
        setTimeout(() => reject({ error: new Error('Timeout beim Testen der Spalte') }), 5000)
      );
      
      const queryPromise = supabase
        .from('orders')
        .select(column)
        .limit(1);
        
      // Race zwischen Query und Timeout
      const result = await Promise.race([queryPromise, timeoutPromise]) as { error: Error | null };
      
      if (result.error) {
        console.log(`Column '${column}': ERROR (${result.error.message})`);
        columnsStatus[column] = 'error';
      } else {
        console.log(`Column '${column}': EXISTS`);
        columnsStatus[column] = 'exists';
      }
    } catch (e) {
      console.log(`Column '${column}': ERROR (unknown)`, e instanceof Error ? e.message : String(e));
      columnsStatus[column] = 'error';
    }
  }
  
  // Ermittle erkannte Spalten
  const detectedColumns = possibleColumns.filter(
    column => columnsStatus[column] === 'exists'
  );
  
  console.log('----------------------------------------');
  console.log(`Detected columns: (${detectedColumns.length}) ${JSON.stringify(detectedColumns)}`);
  
  // Bestimme den Schema-Typ
  let schemaType: 'json' | 'columnar' | 'mixed' | 'minimal' | 'unknown' = 'unknown';
  
  if (detectedColumns.includes('data') || detectedColumns.includes('order_data') || detectedColumns.includes('order_json')) {
    schemaType = 'json';
  } else if (
    detectedColumns.includes('items_json') && 
    detectedColumns.includes('subtotal') && 
    detectedColumns.includes('total')
  ) {
    schemaType = 'columnar';
  } else if (
    detectedColumns.includes('shipping_address_id') &&
    detectedColumns.includes('billing_address_id') &&
    detectedColumns.includes('subtotal')
  ) {
    schemaType = 'columnar';
  } else if (detectedColumns.length <= 3) {
    schemaType = 'minimal';
  } else if (detectedColumns.length > 0) {
    schemaType = 'mixed';
  }
  
  console.log(`Schema type: ${schemaType}`);
  
  return {
    columnsStatus,
    detectedColumns,
    schemaType
  };
}

/**
 * Erstellt die orders-Tabelle nach dem erkannten Schema
 */
export async function createOrdersTable(supabase: SupabaseClient, schemaType: string = 'columnar') {
  console.log(`Creating orders table with schema type: ${schemaType}...`);
  
  let query = '';
  
  if (schemaType === 'json') {
    query = `
      CREATE TABLE IF NOT EXISTS public.orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) NOT NULL,
        data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
  } else {
    // Standard-Spaltenstruktur
    query = `
      CREATE TABLE IF NOT EXISTS public.orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) NOT NULL,
        items_json JSONB,
        subtotal DECIMAL(10, 2),
        tax DECIMAL(10, 2),
        shipping_fee DECIMAL(10, 2),
        total DECIMAL(10, 2),
        payment_method TEXT,
        delivery_method TEXT,
        status TEXT DEFAULT 'pending',
        shipping_address_json JSONB,
        pickup_location TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
  }
  
  // RLS aktivieren
  query += `
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY IF NOT EXISTS "Users can view their own orders" 
      ON public.orders
      FOR SELECT
      USING (auth.uid() = user_id);
    
    CREATE POLICY IF NOT EXISTS "Users can insert their own orders" 
      ON public.orders
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  `;
  
  const { error } = await supabase.rpc('exec_sql', { sql: query });
  
  if (error) {
    console.error('Error creating orders table:', error);
    return { success: false, error };
  }
  
  return { success: true };
}
