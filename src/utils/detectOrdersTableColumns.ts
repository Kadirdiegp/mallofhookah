import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Funktionstyp für Spaltenüberprüfung
 */
type ColumnStatus = 'exists' | 'error' | 'unknown';

/**
 * Erkennt die Struktur der reseller_orders-Tabelle
 */
export async function detectOrdersTableColumns(supabase: SupabaseClient): Promise<{
  columnsStatus: Record<string, ColumnStatus>;
  detectedColumns: string[];
  schemaType: 'embedded' | 'minimal' | 'unknown';
}> {
  console.log('Detecting reseller_orders table column structure...');
  
  // Mögliche Spaltennamen in der Tabelle für das neue reseller_orders Schema
  const possibleColumns = [
    'id', 
    'user_id',
    'created_at',
    'updated_at',
    'status',
    'customer_name',
    'customer_email',
    'customer_phone',
    'shipping_name',
    'shipping_street',
    'shipping_apartment',
    'shipping_city',
    'shipping_state',
    'shipping_postal_code',
    'shipping_country',
    'shipping_phone',
    'billing_name',
    'billing_street',
    'billing_apartment',
    'billing_city',
    'billing_state',
    'billing_postal_code',
    'billing_country',
    'billing_phone',
    'subtotal',
    'tax',
    'shipping_cost',
    'discount',
    'total_amount',
    'currency',
    'payment_method',
    'payment_status',
    'shipping_method',
    'tracking_number',
    'shipping_carrier',
    'notes',
    'admin_notes',
    'source'
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
        .from('reseller_orders')
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
  let schemaType: 'embedded' | 'minimal' | 'unknown' = 'unknown';
  
  // Für das neue Schema mit eingebetteten Adressen
  if (
    detectedColumns.includes('shipping_name') &&
    detectedColumns.includes('shipping_street') &&
    detectedColumns.includes('billing_name')
  ) {
    schemaType = 'embedded';
  } else if (detectedColumns.length <= 5) {
    schemaType = 'minimal';
  }
  
  console.log(`Schema type: ${schemaType}`);
  
  return {
    columnsStatus,
    detectedColumns,
    schemaType
  };
}
