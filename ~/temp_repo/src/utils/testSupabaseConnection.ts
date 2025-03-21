import { supabase } from '../services/supabase';

/**
 * Test der Supabase-Verbindung und -Berechtigungen
 */
export async function testSupabaseConnection() {
  const results: Record<string, unknown> = {};
  
  try {
    // 1. Testen, ob wir überhaupt eine Verbindung haben
    console.log('Testing Supabase connection...');
    
    // Session abrufen
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    results.session = {
      status: sessionError ? 'error' : 'success',
      message: sessionError ? sessionError.message : 'Session found',
      data: sessionData
    };
    
    // 2. Überprüfen, ob wir die orders-Tabelle lesen können
    console.log('Testing orders table read...');
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
    
    results.ordersRead = {
      status: ordersError ? 'error' : 'success',
      message: ordersError ? ordersError.message : 'Orders table is readable',
      count: ordersData?.length || 0
    };
    
    // 3. RLS-Test für Einfügen in orders
    console.log('Testing order insert with RLS...');
    const testOrderData = {
      user_id: sessionData?.session?.user?.id,
      status: 'test',
      subtotal: 0.01
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('orders')
      .insert(testOrderData)
      .select();
    
    results.ordersInsert = {
      status: insertError ? 'error' : 'success',
      message: insertError ? insertError.message : 'Insert successful',
      data: insertData
    };
    
    // 4. Auth-Test: Identität überprüfen
    console.log('Testing auth identity...');
    const { data: authData, error: authError } = await supabase.rpc('get_auth_uid');
    
    if (authError) {
      results.authIdentity = {
        status: 'error',
        message: `Error calling get_auth_uid: ${authError.message}`,
        hint: 'The SQL function might not exist yet'
      };
    } else {
      results.authIdentity = {
        status: 'success',
        auth_uid: authData,
        user_id: sessionData?.session?.user?.id,
        match: authData === sessionData?.session?.user?.id
      };
    }
    
    // 5. Test-Bestellung wieder löschen
    if (insertData && insertData.length > 0) {
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', insertData[0].id);
      
      results.cleanup = {
        status: deleteError ? 'error' : 'success',
        message: deleteError ? deleteError.message : 'Test order deleted'
      };
    }
    
    console.log('Tests completed!', results);
    return results;
    
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return {
      generalError: error instanceof Error ? error.message : String(error),
      results
    };
  }
}
