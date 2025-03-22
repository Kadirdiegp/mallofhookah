import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { sendOrderConfirmationEmail } from '../utils/sendOrderConfirmationEmail';

// Define a more specific type for shipping address
interface OrderShippingAddress {
  // From database format
  shipping_name?: string;
  shipping_street?: string;
  shipping_apartment?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  shipping_phone?: string;
  
  // From previous format
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

// Updated interface to accept multiple possible formats for shipping address
interface OrderDetail {
  orderId: string;
  orderData: {
    items: Array<{
      order_id: string;
      product_id: string;
      quantity: number;
      price_per_unit: number;
      total_price: number;
      product_name?: string;
      product_image?: string;
    }>;
    total: number;
    subtotal: number;
    paymentMethod: string;
    deliveryMethod: string;
    shippingAddress: OrderShippingAddress; 
  };
}

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  // Bestelldaten
  const [orderDetails, setOrderDetails] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Bestellnummer aus der URL extrahieren (Route-Parameter oder Query-Parameter)
  const routeOrderId = params.id;
  const queryOrderId = new URLSearchParams(location.search).get('order_id');
  const orderId = routeOrderId || queryOrderId;
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      console.log("Attempting to fetch order details for ID:", orderId);
      try {
        // Fall 1: Details wurden über location.state übergeben
        if (location.state && location.state.orderId && location.state.orderData) {
          console.log("Using order details from location state");
          setOrderDetails({
            orderId: location.state.orderId,
            orderData: location.state.orderData
          });
          setError('');
        } 
        // Fall 2: Versuche, die Bestellung aus der Datenbank zu laden (falls möglich)
        else if (orderId) {
          console.log("Fetching order from database with ID:", orderId);
          const { data: sessionData } = await supabase.auth.getSession();
          const userId = sessionData?.session?.user?.id;
          
          console.log("Current user ID:", userId);
          
          if (!userId) {
            setError('Sie müssen eingeloggt sein, um Ihre Bestellungen zu sehen');
            setIsLoading(false);
            return;
          }
          
          // Try to fetch the order without user_id filter first (debug only)
          const { data: allOrderData, error: allOrderError } = await supabase
            .from('reseller_orders')
            .select('*')
            .eq('id', orderId)
            .single();
            
          console.log("Debug - Order exists?", !!allOrderData, "Error:", allOrderError);
          
          // Bestellung aus der reseller_orders Tabelle abrufen - without user_id filter
          const { data: orderData, error: orderError } = await supabase
            .from('reseller_orders')
            .select('*, reseller_order_items(*)')
            .eq('id', orderId)
            .single();
            
          if (orderError) {
            console.error('Fehler beim Laden der Bestellung:', orderError);
            console.log('Order Error Details:', JSON.stringify(orderError));
            setError('Die Bestellung konnte nicht geladen werden.');
            setIsLoading(false);
            return;
          }
          
          console.log("Order data found:", orderData);
          console.log("Order items from join:", orderData.reseller_order_items);
          
          // Create proper order items array
          const orderItems = orderData.reseller_order_items || [];
          
          // Always set order details even if shipping address is null or empty
          setOrderDetails({
            orderId: orderData.id,
            orderData: {
              items: orderItems,
              total: orderData.total_amount || 0,
              subtotal: orderData.subtotal || 0,
              paymentMethod: orderData.payment_method || 'unbekannt',
              deliveryMethod: orderData.shipping_method || 'shipping',
              // Always create a shipping address object even if fields are incomplete
              shippingAddress: {
                shipping_name: orderData.shipping_name || '',
                shipping_street: orderData.shipping_street || '',
                shipping_apartment: orderData.shipping_apartment || '',
                shipping_city: orderData.shipping_city || '',
                shipping_state: orderData.shipping_state || '',
                shipping_postal_code: orderData.shipping_postal_code || '',
                shipping_country: orderData.shipping_country || '',
                shipping_phone: orderData.shipping_phone || '',
                // Add properties for compatibility with the imported ShippingAddress type
                firstName: orderData.shipping_name?.split(' ')[0] || '',
                lastName: orderData.shipping_name?.split(' ').slice(1).join(' ') || '',
                address1: orderData.shipping_street || '',
                address2: orderData.shipping_apartment || '',
                city: orderData.shipping_city || '',
                state: orderData.shipping_state || '',
                postalCode: orderData.shipping_postal_code || '',
                country: orderData.shipping_country || '',
                phone: orderData.shipping_phone || ''
              }
            }
          });
          setError('');
        } else {
          console.error('No order ID found in URL');
          setError('Keine Bestelldetails gefunden');
        }
      } catch (err) {
        console.error('Fehler:', err);
        setError('Ein unerwarteter Fehler ist aufgetreten');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [location.state, orderId]);
  
  // Separate useEffect für E-Mail-Versand
  useEffect(() => {
    // E-Mail-Versand nur durchführen, wenn orderDetails existieren
    if (orderDetails) {
      const simulateSendOrderConfirmationEmail = async () => {
        try {
          // Benutzerinformationen abrufen
          const { data: sessionData } = await supabase.auth.getSession();
          const userEmail = sessionData?.session?.user?.email;
          const userId = sessionData?.session?.user?.id;
          
          if (!userEmail || !userId || !orderDetails) {
            console.warn('Keine Benutzerinformationen oder Bestelldetails für E-Mail-Versand');
            return;
          }
          
          // Benutzerinformationen direkt aus der Auth-Session abrufen
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('Fehler beim Abrufen der Benutzerdaten:', userError);
          }
          
          // Versuche, den Namen aus verschiedenen Quellen zu bekommen
          let userName = 'Kunde';  // Standardname
          
          // 1. Aus dem Auth.User Metadaten
          if (user?.user_metadata?.full_name) {
            userName = user.user_metadata.full_name;
          } 
          // 2. Aus dem Auth.User Metadaten (Einzelkomponenten)
          else if (user?.user_metadata?.first_name || user?.user_metadata?.last_name) {
            userName = `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.trim();
          }
          // 3. Aus der E-Mail-Adresse (Fallback)
          else if (userEmail) {
            userName = userEmail.split('@')[0];
          }
          
          console.log('Verwendeter Benutzername für E-Mail:', userName);
          
          // Get product info for each order item
          const enhancedItems = await Promise.all(
            orderDetails.orderData.items.map(async (item) => {
              try {
                // If we already have product details, return as is
                if (item.product_name) return item;
                
                // Fetch product details
                const { data: productData } = await supabase
                  .from('products')
                  .select('name, images')
                  .eq('id', item.product_id)
                  .single();
                  
                return {
                  ...item,
                  product_name: productData?.name || 'Unknown Product',
                  product_image: productData?.images ? productData.images[0] : null
                };
              } catch (err) {
                console.error('Error fetching product details:', err);
                return item;
              }
            })
          );
          
          // Send email with the enhanced order items
          const emailSent = await sendOrderConfirmationEmail({
            orderId: orderDetails.orderId,
            userEmail,
            userName,
            orderItems: enhancedItems,
            total: orderDetails.orderData.total,
            subtotal: orderDetails.orderData.subtotal,
            shipping: orderDetails.orderData.total - orderDetails.orderData.subtotal,
            paymentMethod: orderDetails.orderData.paymentMethod,
            deliveryMethod: orderDetails.orderData.deliveryMethod,
            shippingAddress: orderDetails.orderData.shippingAddress
          });
          
          console.log(`Bestellbestätigung per E-Mail ${emailSent ? 'erfolgreich' : 'nicht'} gesendet`);
        } catch (error) {
          console.error('Fehler beim Senden der Bestätigungs-E-Mail:', error);
        }
      };
      simulateSendOrderConfirmationEmail();
    }
  }, [orderDetails]);
  
  // Zur Startseite nach 30 Sekunden weiterleiten
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      navigate('/');
    }, 30000);
    
    return () => clearTimeout(redirectTimer);
  }, [navigate]);
  
  // Formatieren eines Preises
  const formatPrice = (price: number): string => {
    return (price || 0).toFixed(2) + ' €';
  };
  
  if (isLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-white">Bestelldetails werden geladen...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-black rounded-lg shadow-md border border-gray-800 p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-900 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4 text-white">Fehler</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          
          <div className="flex flex-col space-y-3">
            <Link 
              to="/profile" 
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Zu meinem Profil
            </Link>
            <Link 
              to="/" 
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-black min-h-screen py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black rounded-lg shadow-md border border-gray-800 p-8">
          <div className="mb-6 flex items-center">
            <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mr-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Bestellung erfolgreich aufgegeben!</h1>
              <p className="text-gray-400">
                Bestellnummer: <span className="font-medium text-white">{orderDetails?.orderId || 'N/A'}</span>
              </p>
            </div>
          </div>
          
          <div className="border-b border-gray-800 pb-6 mb-6">
            <p className="text-gray-400">
              Vielen Dank für Ihre Bestellung. Wir haben eine Bestätigungs-E-Mail mit den Details an Ihre E-Mail-Adresse gesendet.
            </p>
          </div>
          
          {orderDetails && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Bestellübersicht</h2>
              
              <div className="bg-gray-900 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-400 mb-2">Zahlungsmethode</h3>
                    <p className="font-medium text-white">
                      {orderDetails.orderData.paymentMethod === 'credit_card' && 'Kreditkarte'}
                      {orderDetails.orderData.paymentMethod === 'paypal' && 'PayPal'}
                      {orderDetails.orderData.paymentMethod === 'klarna' && 'Klarna'}
                      {orderDetails.orderData.paymentMethod === 'cash_on_delivery' && 'Nachnahme'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-400 mb-2">Liefermethode</h3>
                    <p className="font-medium text-white">
                      {orderDetails.orderData.deliveryMethod === 'shipping' ? 'Versand' : 'Abholung im Geschäft'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-400 mb-2">Gesamtsumme</h3>
                    <p className="font-medium text-white">{formatPrice(orderDetails.orderData.total)}</p>
                  </div>
                </div>
              </div>
              
              {/* Only show shipping address if we have at least some basic address info */}
              {orderDetails.orderData.shippingAddress && 
               (orderDetails.orderData.shippingAddress.shipping_street || 
                orderDetails.orderData.shippingAddress.shipping_city ||
                orderDetails.orderData.shippingAddress.shipping_postal_code) && (
                <div className="mb-6">
                  <h3 className="font-medium text-white mb-2">Lieferadresse</h3>
                  <address className="not-italic text-gray-400">
                    {/* Display name - support multiple formats */}
                    {(orderDetails.orderData.shippingAddress.shipping_name || 
                      (orderDetails.orderData.shippingAddress.firstName && orderDetails.orderData.shippingAddress.lastName && 
                        `${orderDetails.orderData.shippingAddress.firstName} ${orderDetails.orderData.shippingAddress.lastName}`) ||
                      ''
                    )}<br />
                    
                    {/* Display street/address - support multiple formats */}
                    {(orderDetails.orderData.shippingAddress.shipping_street || 
                      orderDetails.orderData.shippingAddress.address1 || 
                      '')}<br />
                    
                    {/* Display apartment/address2 if available */}
                    {(orderDetails.orderData.shippingAddress.shipping_apartment || 
                      orderDetails.orderData.shippingAddress.address2) && 
                      `${orderDetails.orderData.shippingAddress.shipping_apartment || 
                          orderDetails.orderData.shippingAddress.address2}<br />`}
                    
                    {/* Display postal code and city */}
                    {(orderDetails.orderData.shippingAddress.shipping_postal_code || 
                      orderDetails.orderData.shippingAddress.postalCode || '')} {' '}
                    {(orderDetails.orderData.shippingAddress.shipping_city || 
                      orderDetails.orderData.shippingAddress.city || '')}<br />
                    
                    {/* Display country */}
                    {(orderDetails.orderData.shippingAddress.shipping_country || 
                      orderDetails.orderData.shippingAddress.country || '')}
                  </address>
                </div>
              )}
              
              <h3 className="font-medium text-white mb-3">Bestellte Artikel</h3>
              <div className="border border-gray-800 rounded-lg overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-gray-900">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Produkt
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Menge
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Preis
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Gesamt
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-black divide-y divide-gray-800">
                      {orderDetails.orderData.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                            {item.product_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-right">
                            {formatPrice(item.price_per_unit)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium text-right">
                            {formatPrice(item.total_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-900">
                      <tr>
                        <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400"></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-400 text-right">
                          Zwischensumme
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white text-right">
                          {formatPrice(orderDetails.orderData.subtotal)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400"></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-400 text-right">
                          Versand
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white text-right">
                          {formatPrice(orderDetails.orderData.total - orderDetails.orderData.subtotal)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400"></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white text-right">
                          Gesamtsumme
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white text-right">
                          {formatPrice(orderDetails.orderData.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
            <Link 
              to="/profile" 
              className="flex-1 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium transition-colors text-center"
            >
              Zu meinem Profil
            </Link>
            <Link 
              to="/" 
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium transition-colors text-center"
            >
              Zurück zur Startseite
            </Link>
          </div>
          
          <p className="text-sm text-gray-400 mt-8 text-center">
            Sie werden in 30 Sekunden automatisch zur Startseite weitergeleitet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
