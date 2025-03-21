import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { ShippingAddress } from '../types';
import { sendOrderConfirmationEmail } from '../utils/sendOrderConfirmationEmail';

interface OrderDetail {
  orderId: string;
  orderData: {
    items: Array<{
      order_id: string;
      product_id: string;
      quantity: number;
      price_per_unit: number;
      total_price: number;
    }>;
    total: number;
    subtotal: number;
    paymentMethod: string;
    deliveryMethod: string;
    shippingAddress: ShippingAddress | null;
  };
}

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Bestelldaten
  const [orderDetails, setOrderDetails] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Bestellnummer aus der URL extrahieren (falls vorhanden)
  const orderId = new URLSearchParams(location.search).get('order_id');
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        // Fall 1: Details wurden über location.state übergeben
        if (location.state && location.state.orderId && location.state.orderData) {
          setOrderDetails({
            orderId: location.state.orderId,
            orderData: location.state.orderData
          });
          setError('');
        } 
        // Fall 2: Versuche, die Bestellung aus der Datenbank zu laden (falls möglich)
        else if (orderId) {
          const { data: sessionData } = await supabase.auth.getSession();
          const userId = sessionData?.session?.user?.id;
          
          if (!userId) {
            setError('Sie müssen eingeloggt sein, um Ihre Bestellungen zu sehen');
            setIsLoading(false);
            return;
          }
          
          const { data, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', userId)
            .single();
            
          if (fetchError || !data) {
            console.error('Fehler beim Laden der Bestellung:', fetchError);
            setError('Die angeforderte Bestellung konnte nicht gefunden werden');
          } else {
            // Bestellitems abrufen
            const { data: itemsData, error: itemsError } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', orderId);
              
            if (itemsError) {
              console.error('Fehler beim Laden der Bestellitems:', itemsError);
            }
            
            // Bestelldaten zusammensetzen
            setOrderDetails({
              orderId: data.id,
              orderData: {
                items: itemsData || [],
                total: data.total_amount,
                subtotal: data.subtotal,
                paymentMethod: data.payment_method,
                deliveryMethod: data.delivery_method,
                shippingAddress: data.shipping_address
              }
            });
            setError('');
          }
        } else {
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
    
    // E-Mail-Versand simulieren nur durchführen, wenn orderDetails existieren
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
          
          // Demo: E-Mail senden mit den verfügbaren Daten
          const emailSent = await sendOrderConfirmationEmail({
            orderId: orderDetails.orderId,
            userEmail,
            userName,
            orderItems: orderDetails.orderData.items,
            total: orderDetails.orderData.total,
            subtotal: orderDetails.orderData.subtotal,
            shipping: orderDetails.orderData.total - orderDetails.orderData.subtotal,
            paymentMethod: orderDetails.orderData.paymentMethod,
            deliveryMethod: orderDetails.orderData.deliveryMethod,
            shippingAddress: orderDetails.orderData.shippingAddress || undefined
          });
          
          console.log(`Bestellbestätigung per E-Mail ${emailSent ? 'erfolgreich' : 'nicht'} gesendet`);
        } catch (error) {
          console.error('Fehler beim Senden der Bestätigungs-E-Mail:', error);
        }
      };
      simulateSendOrderConfirmationEmail();
    }
    
    // Zur Startseite nach 30 Sekunden weiterleiten
    const redirectTimer = setTimeout(() => {
      navigate('/');
    }, 30000);
    
    return () => clearTimeout(redirectTimer);
  }, [navigate, location, orderId, orderDetails]);
  
  // Formatieren eines Preises
  const formatPrice = (price: number): string => {
    return (price || 0).toFixed(2) + ' €';
  };
  
  if (isLoading) {
    return (
      <div className="bg-light min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Bestelldetails werden geladen...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-light min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Fehler</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="flex flex-col space-y-3">
            <Link 
              to="/profile" 
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Zu meinem Profil
            </Link>
            <Link 
              to="/" 
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors"
            >
              Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-light min-h-screen py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6 flex items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Bestellung erfolgreich aufgegeben!</h1>
              <p className="text-gray-600">
                Bestellnummer: <span className="font-medium">{orderDetails?.orderId || 'N/A'}</span>
              </p>
            </div>
          </div>
          
          <div className="border-b border-gray-200 pb-6 mb-6">
            <p className="text-gray-600">
              Vielen Dank für Ihre Bestellung. Wir haben eine Bestätigungs-E-Mail mit den Details an Ihre E-Mail-Adresse gesendet.
            </p>
          </div>
          
          {orderDetails && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Bestellübersicht</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-500 mb-2">Zahlungsmethode</h3>
                    <p className="font-medium">
                      {orderDetails.orderData.paymentMethod === 'credit_card' && 'Kreditkarte'}
                      {orderDetails.orderData.paymentMethod === 'paypal' && 'PayPal'}
                      {orderDetails.orderData.paymentMethod === 'klarna' && 'Klarna'}
                      {orderDetails.orderData.paymentMethod === 'cash_on_delivery' && 'Nachnahme'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-500 mb-2">Liefermethode</h3>
                    <p className="font-medium">
                      {orderDetails.orderData.deliveryMethod === 'shipping' ? 'Versand' : 'Abholung im Geschäft'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-500 mb-2">Gesamtsumme</h3>
                    <p className="font-medium">{formatPrice(orderDetails.orderData.total)}</p>
                  </div>
                </div>
              </div>
              
              {orderDetails.orderData.shippingAddress && orderDetails.orderData.deliveryMethod === 'shipping' && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2">Lieferadresse</h3>
                  <address className="not-italic">
                    {orderDetails.orderData.shippingAddress.firstName} {orderDetails.orderData.shippingAddress.lastName}<br />
                    {orderDetails.orderData.shippingAddress.address1}<br />
                    {orderDetails.orderData.shippingAddress.address2 && `${orderDetails.orderData.shippingAddress.address2}<br />`}
                    {orderDetails.orderData.shippingAddress.postalCode} {orderDetails.orderData.shippingAddress.city}<br />
                    {orderDetails.orderData.shippingAddress.country}
                  </address>
                </div>
              )}
              
              <h3 className="font-medium text-gray-700 mb-3">Bestellte Artikel</h3>
              <div className="border rounded-lg overflow-hidden mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produkt
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Menge
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preis
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gesamt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderDetails.orderData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.product_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatPrice(item.price_per_unit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
                          {formatPrice(item.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 text-right">
                        Zwischensumme
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatPrice(orderDetails.orderData.subtotal)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 text-right">
                        Versand
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatPrice(orderDetails.orderData.total - orderDetails.orderData.subtotal)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                        Gesamtsumme
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                        {formatPrice(orderDetails.orderData.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
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
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors text-center"
            >
              Zurück zur Startseite
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 mt-8 text-center">
            Sie werden in 30 Sekunden automatisch zur Startseite weitergeleitet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
