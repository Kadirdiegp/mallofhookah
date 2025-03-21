import { supabase } from '../services/supabase';

/**
 * Utility to detect the actual column structure of the addresses table
 */
export async function detectAddressTableColumns() {
  console.log('Detecting addresses table column structure...');
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No authenticated user found');
    return null;
  }
  
  // Try to check columns one by one to detect the actual structure
  const possibleColumns = [
    'id', 'user_id', 'address', 'street', 'street_address', 'city', 'state', 
    'postal_code', 'postalCode', 'zip', 'zip_code', 'country', 
    'created_at', 'updated_at', 'first_name', 'last_name'
  ];
  
  const columnsStatus: Record<string, boolean> = {};
  const detectedColumns: string[] = [];
  
  for (const column of possibleColumns) {
    try {
      // Try to select just this column
      const { error } = await supabase
        .from('addresses')
        .select(column)
        .limit(1);
      
      // Record whether this column exists
      columnsStatus[column] = !error;
      
      if (error) {
        // Check if the error is related to column not existing
        const isColumnError = error.message.includes(`column "${column}" does not exist`) ||
                              error.message.includes(`relation "addresses" does not exist`) ||
                              error.message.includes(`Could not find the "${column}" column`);
        
        console.log(`Column '${column}': ${isColumnError ? 'NOT EXISTS (confirmed)' : 'ERROR (unknown)'}`);
      } else {
        console.log(`Column '${column}': EXISTS`);
        detectedColumns.push(column);
      }
    } catch (e) {
      console.error(`Error checking column '${column}':`, e);
      columnsStatus[column] = false;
    }
  }
  
  // Determine likely table structure
  console.log('----------------------------------------');
  console.log('Detected columns:', detectedColumns);
  
  // Determine schema type
  let schemaType = 'unknown';
  
  if (columnsStatus['first_name']) {
    schemaType = 'profile';
    console.log('Schema type: Profile (includes name fields)');
  } else if (columnsStatus['address'] && !columnsStatus['street']) {
    schemaType = 'json';
    console.log('Schema type: JSON (single address field)');
  } else if (columnsStatus['street'] && columnsStatus['city']) {
    schemaType = 'individual';
    console.log('Schema type: Individual columns');
  } else if (columnsStatus['user_id']) {
    schemaType = 'minimal';
    console.log('Schema type: Minimal (only has user_id)');
  } else {
    console.log('Schema type: Unknown or table does not exist');
  }
  
  return {
    columnsStatus,
    detectedColumns,
    schemaType
  };
}
