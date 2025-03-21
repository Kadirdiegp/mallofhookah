import { supabase } from '../services/supabase';

/**
 * Test database permissions for the addresses table
 */
export async function testAddressesTablePermissions() {
  console.log('Testing addresses table permissions...');
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No authenticated user found');
    return;
  }
  
  console.log('Current user:', user.id);
  
  // Test SELECT permissions and get table structure
  console.log('Testing SELECT permissions and getting table structure...');
  try {
    // First check if we can access the table at all
    const { data: selectData, error: selectError } = await supabase
      .from('addresses')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('Error in SELECT:', selectError);
    } else {
      console.log('SELECT successful:', selectData);
      
      // Try to get the table definition
      try {
        const { data: definition, error: definitionError } = await supabase
          .rpc('get_table_definition', { table_name: 'addresses' });
        
        if (definitionError) {
          console.log('Direct inspection of table structure:');
          // Try a different approach - checking column names by querying them one by one
          const possibleColumns = [
            'id', 'user_id', 'street', 'address', 'city', 'state', 'postal_code', 
            'postalCode', 'zip', 'zip_code', 'country', 'created_at', 'updated_at'
          ];
          
          for (const column of possibleColumns) {
            const { error } = await supabase
              .from('addresses')
              .select(column)
              .limit(1);
            
            console.log(`Column '${column}': ${error ? 'NOT EXISTS' : 'EXISTS'}`);
          }
        } else {
          console.log('Table definition:', definition);
        }
      } catch (e) {
        console.log('RPC not available, trying direct inspection');
        console.log('Error:', e);
        const possibleColumns = [
          'id', 'user_id', 'street', 'address', 'city', 'state', 'postal_code', 
          'postalCode', 'zip', 'zip_code', 'country', 'created_at', 'updated_at'
        ];
        
        for (const column of possibleColumns) {
          const { error } = await supabase
            .from('addresses')
            .select(column)
            .limit(1);
          
          console.log(`Column '${column}': ${error ? 'NOT EXISTS' : 'EXISTS'}`);
        }
      }
    }
  } catch (e) {
    console.error('Error testing table structure:', e);
  }
  
  // Test INSERT permissions
  console.log('Testing INSERT permissions...');
  const testData = {
    user_id: user.id,
    street: 'Test Street',
    city: 'Test City',
    state: 'Test State',
    postal_code: '12345',
    country: 'Test Country',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data: insertData, error: insertError } = await supabase
    .from('addresses')
    .insert(testData)
    .select();
  
  if (insertError) {
    console.error('Error in INSERT:', insertError);
  } else {
    console.log('INSERT successful:', insertData);
    
    // If insert was successful, also test UPDATE and DELETE
    if (insertData && insertData.length > 0) {
      const insertedId = insertData[0].id;
      
      // Test UPDATE
      console.log('Testing UPDATE permissions...');
      const { data: updateData, error: updateError } = await supabase
        .from('addresses')
        .update({ street: 'Updated Test Street' })
        .eq('id', insertedId)
        .select();
      
      if (updateError) {
        console.error('Error in UPDATE:', updateError);
      } else {
        console.log('UPDATE successful:', updateData);
      }
      
      // Test DELETE
      console.log('Testing DELETE permissions...');
      const { error: deleteError } = await supabase
        .from('addresses')
        .delete()
        .eq('id', insertedId);
      
      if (deleteError) {
        console.error('Error in DELETE:', deleteError);
      } else {
        console.log('DELETE successful');
      }
    }
  }
}
