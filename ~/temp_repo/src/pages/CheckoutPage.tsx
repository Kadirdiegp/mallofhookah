import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cart';
import { ShippingAddress } from '../types';
import { supabase } from '../services/supabase';
import { detectAddressTableColumns } from '../utils/detectAddressTableColumns';
import { detectOrdersTableColumns, createOrdersTable } from '../utils/detectOrdersTableColumns';
import { verifyAuthUserId } from '../utils/verifyAuth';

// Konstanten für den Store
const STORE_ADDRESS = "Gröpelinger Heerstraße 214A, 28237 Bremen";
const DELIVERY_THRESHOLD_1 = 39; // Ab 39 Euro kostenlose Lieferung im nahen Radius
const DELIVERY_THRESHOLD_2 = 49; // Ab 49 Euro kostenlose Lieferung im erweiterten Radius
const DELIVERY_FEE = 5.99; // Standard-Liefergebühr

// PLZ in verschiedenen Lieferradien
const CLOSE_RADIUS_ZIP_CODES = [
  '28237', '28239', '28719', '28717', '28755', '28197'
]; // PLZ im nahen Umkreis
const EXTENDED_RADIUS_ZIP_CODES = [
  '28195', '28199', '28203', '28205', '28207', '28209', 
  '28211', '28213', '28215', '28217', '28219', '28259',
  '28307', '28325', '28327', '28329', '28355', '28357',
  '28359', '28717', '28719', '28755', '28757', '28759', 
  '28790', '28816', '28832'
]; // PLZ im erweiterten Umkreis

// Lieferung oder Abholung
type DeliveryMethod = 'shipping' | 'pickup';
// Zahlungsmethoden
type PaymentMethod = 'credit_card' | 'paypal' | 'klarna' | 'cash_on_delivery';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState(1); // 1: shipping, 2: payment, 3: review
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [error, setError] = useState<string | null>(null);
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'DE', // Deutschland als Standard-Land
    phone: ''
  });

  // Funktion zum Speichern der Lieferadresse in der Datenbank
  async function saveShippingAddressToDatabase() {
    try {
      if (deliveryMethod !== 'shipping' || !shippingAddress.firstName) {
        // Wenn keine Lieferung gewählt wurde oder keine Adressdaten eingegeben wurden
        return null;
      }
      
      // Prüfen, ob der Benutzer angemeldet ist
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user?.id) {
        console.error('Kein angemeldeter Benutzer');
        return null;
      }
      
      // Vorbereiten der Adressdaten
      const addressData = {
        user_id: sessionData.session.user.id,
        first_name: shippingAddress.firstName,
        last_name: shippingAddress.lastName,
        street_address: shippingAddress.address1,
        apartment: shippingAddress.address2 || null,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone || '0000000000',
        is_default_shipping: true,  // Als Standard-Lieferadresse setzen
        is_default_billing: true    // Als Standard-Rechnungsadresse setzen
      };
      
      console.log('Speichere Adresse:', addressData);
      
      // Adresse in der Datenbank speichern
      const { data: addressResult, error: addressError } = await supabase
        .from('addresses')
        .insert(addressData)
        .select();
        
      if (addressError) {
        console.error('Fehler beim Speichern der Adresse:', addressError);
        return null;
      }
      
      console.log('Adresse erfolgreich gespeichert:', addressResult);
      
      // Wenn die Adresse erfolgreich gespeichert wurde, ID zurückgeben
      if (addressResult && addressResult.length > 0) {
        return {
          ...shippingAddress,
          id: addressResult[0].id
        };
      }
      
      return null;
    } catch (error) {
      console.error('Unerwarteter Fehler beim Speichern der Adresse:', error);
      return null;
    }
  }

  // Prüfen, ob die orders-Tabelle existiert und ggf. erstellen
  useEffect(() => {
    const checkOrdersTable = async () => {
      try {
        // Zuerst prüfen, ob die Tabelle überhaupt existiert
        const { error } = await supabase
          .from('orders')
          .select('*')
          .limit(1);
          
        if (error && error.code === '42P01') {
          console.log('Orders-Tabelle existiert nicht, erstelle sie...');
          await createOrdersTable(supabase);
        } else {
          // Wenn die Tabelle existiert, prüfen wir die Struktur
          const orderSchema = await detectOrdersTableColumns(supabase);
          console.log('Orders-Tabelle Schema erkannt:', orderSchema);
        }
      } catch (error) {
        console.error('Fehler beim Prüfen der orders-Tabelle:', error);
      }
    };
    
    checkOrdersTable();
  }, []);

  // Lade Benutzeradresse beim Seitenaufruf
  useEffect(() => {
    const loadUserAddress = async () => {
      setIsLoading(true);
      
      try {
        console.log('Starte Laden der Benutzerdaten...');
        
        // Aktuellen Benutzer holen
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        
        console.log('Benutzer gefunden:', user?.id);
        
        if (user) {
          // Spaltenstruktur der addresses-Tabelle erkennen
          const tableStructure = await detectAddressTableColumns();
          console.log('Erkannte Tabellenstruktur:', tableStructure);
          
          // Profil des Benutzers abrufen
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            console.error('Fehler beim Laden des Profils:', profileError);
          }
          
          console.log('Profildaten gefunden:', profileData);
          
          // Bei auth.users die Metadaten anschauen
          const { data: userMetadata, error: userMetadataError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (userMetadataError) {
            console.error('Fehler beim Laden der User-Metadaten:', userMetadataError);
          } else {
            console.log('User-Metadaten:', userMetadata);
          }
          
          // Hole die raw metadata aus der Auth-Session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error('Fehler beim Laden der Session:', sessionError);
          } else if (session) {
            console.log('User raw metadata:', session.user.user_metadata);
          }
          
          // Adresse des Benutzers abrufen
          const { data: addressData, error: addressError } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (addressError) {
            console.error('Fehler beim Laden der Adresse:', addressError);
          }
          
          console.log('Adressdaten gefunden:', addressData);
            
          if (profileData || addressData) {
            // Daten für das Formular aufbereiten - speziell auf die Straße achten
            const newShippingAddress = {
              firstName: (addressData?.first_name || profileData?.first_name || ''),
              lastName: (addressData?.last_name || profileData?.last_name || ''),
              // Straße könnte in unterschiedlichen Feldern gespeichert sein
              address1: (addressData?.street_address || addressData?.street || 
                       (profileData?.address_street ? profileData.address_street : 
                       (profileData?.address?.street ? profileData.address.street : ''))),
              address2: (addressData?.apartment || addressData?.apt || 
                       (profileData?.address_apt ? profileData.address_apt : 
                       (profileData?.address?.apt ? profileData.address.apt : ''))),
              city: (addressData?.city || 
                    (profileData?.address_city ? profileData.address_city : 
                    (profileData?.address?.city ? profileData.address.city : ''))),
              state: (addressData?.state || 
                     (profileData?.address_state ? profileData.address_state : 
                     (profileData?.address?.state ? profileData.address.state : ''))),
              postalCode: (addressData?.postal_code || 
                          (profileData?.address_postal_code ? profileData.address_postal_code : 
                          (profileData?.address?.postalCode ? profileData.address.postalCode : ''))),
              country: (addressData?.country || 
                       (profileData?.address_country ? profileData.address_country : 
                       (profileData?.address?.country ? profileData.address.country : 'DE'))),
              phone: (addressData?.phone || profileData?.phone || '')
            };
            
            console.log('Setze Adressdaten:', newShippingAddress);
            setShippingAddress(newShippingAddress);
          } else {
            console.log('Keine Profil- oder Adressdaten gefunden');
          }
        } else {
          console.log('Kein Benutzer angemeldet');
        }
      } catch (error) {
        console.error('Fehler beim Laden der Benutzerdaten:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserAddress();
  }, []);
  
  // Calculate totals
  const subtotal = totalPrice();
  const tax = subtotal * 0.19; // 19% MwSt in Deutschland
  
  // Berechne Versandkosten basierend auf Liefermethode und PLZ
  const calculateShippingCost = (): number => {
    if (deliveryMethod === 'pickup') {
      return 0;
    }
    
    const postalCode = shippingAddress.postalCode;
    
    // Wenn der Einkaufswert >= DELIVERY_THRESHOLD_2, kostenlose Lieferung für alle
    if (subtotal >= DELIVERY_THRESHOLD_2) {
      return 0;
    }
    
    // Wenn der Einkaufswert >= DELIVERY_THRESHOLD_1 und im nahen Umkreis, kostenlose Lieferung
    if (subtotal >= DELIVERY_THRESHOLD_1 && CLOSE_RADIUS_ZIP_CODES.includes(postalCode)) {
      return 0;
    }
    
    // Wenn der Einkaufswert >= DELIVERY_THRESHOLD_2 und im erweiterten Umkreis, kostenlose Lieferung
    if (subtotal >= DELIVERY_THRESHOLD_2 && EXTENDED_RADIUS_ZIP_CODES.includes(postalCode)) {
      return 0;
    }
    
    // Ansonsten Standardgebühr
    return DELIVERY_FEE;
  };
  
  const shipping = calculateShippingCost();
  const total = subtotal + tax + shipping;
  
  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ihr Warenkorb ist leer</h2>
          <p className="text-gray-600 mb-8">
            Bitte fügen Sie Artikel zu Ihrem Warenkorb hinzu, bevor Sie zur Kasse gehen.
          </p>
          <button
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium transition-colors"
            onClick={() => navigate('/products')}
          >
            Produkte durchstöbern
          </button>
        </div>
      </div>
    );
  }
  
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo(0, 0);
  };
  
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
    window.scrollTo(0, 0);
  };
  
  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Wenn eine Lieferadresse angegeben wurde, speichern wir sie
      let updatedShippingAddress = shippingAddress;
      if (deliveryMethod === 'shipping') {
        // Adresse in der Datenbank speichern
        const savedAddress = await saveShippingAddressToDatabase();
        if (savedAddress) {
          updatedShippingAddress = savedAddress;
        }
      }
      
      // Benutzer-ID überprüfen
      const { userId, sessionData } = await verifyAuthUserId();
      if (!userId) {
        setError('Sie müssen angemeldet sein, um eine Bestellung aufzugeben.');
        setIsProcessing(false);
        return;
      }
      
      console.log('Aktuelle Session:', {
        userId: userId,
        sessionExpiresAt: sessionData?.session?.expires_at 
      });
      
      // Schema der orders-Tabelle erkennen
      const orderSchema = await detectOrdersTableColumns(supabase);
      console.log('Order schema detected:', orderSchema);
      
      const cartItems = items.map(item => ({
        ...item,
        totalPrice: (item.quantity * item.price).toFixed(2)
      }));
      
      try {
        // Erstellen der Bestellung
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            status: paymentMethod === 'cash_on_delivery' ? 'pending_payment' : 'processing',
            payment_method: paymentMethod,
            subtotal: subtotal,
            total_amount: total + shipping,
            ...(deliveryMethod === 'shipping' && updatedShippingAddress && updatedShippingAddress.id 
              ? { 
                  shipping_address_id: updatedShippingAddress.id,
                  billing_address_id: updatedShippingAddress.id 
                } 
              : {})
          })
          .select();
        
        if (orderError) {
          console.error('Fehler beim Erstellen der Bestellung:', orderError);
          setError(`Fehler beim Erstellen der Bestellung: ${orderError.message}`);
          setIsProcessing(false);
          return;
        }

        // Order ID extrahieren
        const orderId = orderData?.[0]?.id;
        console.log('Bestellung erfolgreich erstellt:', orderId);
        
        if (!orderId) {
          console.error('Keine orderId zurückgegeben');
          setError('Ein Fehler ist aufgetreten, es wurde keine Bestellungs-ID zurückgegeben.');
          setIsProcessing(false);
          return;
        }

        // Bestellpositionen erstellen
        const orderItems = cartItems.map(item => ({
          order_id: orderId,
          product_id: item.productId || item.id, // Verwenden Sie beide möglichen ID-Referenzen
          quantity: item.quantity,
          price_per_unit: item.price,
          total_price: item.price * item.quantity
        }));

        console.log('Erstellte Bestellpositionen:', orderItems);

        // Einfügen der Bestellpositionen
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('Fehler beim Erstellen der Bestellpositionen:', itemsError);
          // Fehler protokollieren, aber nicht abbrechen
        }
        
        // Bestellung erfolgreich, zum Erfolgsbildschirm navigieren
        clearCart();
        navigate('/checkout/success', { 
          state: { 
            orderId,
            orderData: {
              items: orderItems,
              total: total + shipping,
              subtotal,
              paymentMethod,
              deliveryMethod,
              shippingAddress: updatedShippingAddress
            }
          }
        });
      } catch (error) {
        console.error('Unerwarteter Fehler beim Erstellen der Bestellung:', error);
        setError('Ein unerwarteter Fehler ist aufgetreten');
      } finally {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Unerwarteter Fehler beim Erstellen der Bestellung:', error);
      setError('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-light min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Kasse</h1>
        
        {/* Checkout Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <span className="text-sm font-medium">Versand</span>
            </div>
            <div className={`flex-grow h-1 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <span className="text-sm font-medium">Zahlung</span>
            </div>
            <div className={`flex-grow h-1 mx-2 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`flex flex-col items-center ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
              <span className="text-sm font-medium">Überprüfen</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Versandinformationen</h2>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2">Lade Ihre gespeicherten Informationen...</span>
                    </div>
                  ) : (
                    <>
                      {Object.values(shippingAddress).some(value => value) && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                          <p className="text-blue-700">Ihre gespeicherten Adressdaten wurden vorausgefüllt. Bitte überprüfen Sie diese.</p>
                        </div>
                      )}
                      
                      {/* Lieferung vs. Abholung Auswahl */}
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3">Liefermethode</h3>
                        <div className="flex flex-col space-y-3">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="deliveryMethod"
                              value="shipping"
                              checked={deliveryMethod === 'shipping'}
                              onChange={() => setDeliveryMethod('shipping')}
                              className="h-5 w-5 text-primary focus:ring-primary"
                            />
                            <span className="ml-2 text-gray-700">Lieferung (DHL)</span>
                          </label>
                          
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="deliveryMethod"
                              value="pickup"
                              checked={deliveryMethod === 'pickup'}
                              onChange={() => setDeliveryMethod('pickup')}
                              className="h-5 w-5 text-primary focus:ring-primary"
                            />
                            <span className="ml-2 text-gray-700">Abholung im Geschäft</span>
                          </label>
                        </div>
                        
                        {deliveryMethod === 'pickup' && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-md">
                            <p className="font-medium">Abholadresse:</p>
                            <p className="text-gray-600">{STORE_ADDRESS}</p>
                            <p className="text-gray-600 mt-2">
                              Bitte bringen Sie einen Identitätsnachweis mit, 
                              wenn Sie Ihre Bestellung abholen.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {deliveryMethod === 'shipping' && (
                        <form onSubmit={handleShippingSubmit}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
                                Vorname *
                              </label>
                              <input
                                type="text"
                                id="firstName"
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                value={shippingAddress.firstName}
                                onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
                                Nachname *
                              </label>
                              <input
                                type="text"
                                id="lastName"
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                value={shippingAddress.lastName}
                                onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <label htmlFor="address1" className="block text-gray-700 font-medium mb-2">
                              Adresse *
                            </label>
                            <input
                              type="text"
                              id="address1"
                              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              value={shippingAddress.address1}
                              onChange={(e) => setShippingAddress({...shippingAddress, address1: e.target.value})}
                              required
                            />
                          </div>
                          
                          <div className="mb-4">
                            <label htmlFor="address2" className="block text-gray-700 font-medium mb-2">
                              Adresszusatz (Optional)
                            </label>
                            <input
                              type="text"
                              id="address2"
                              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              value={shippingAddress.address2}
                              onChange={(e) => setShippingAddress({...shippingAddress, address2: e.target.value})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label htmlFor="city" className="block text-gray-700 font-medium mb-2">
                                Stadt *
                              </label>
                              <input
                                type="text"
                                id="city"
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                value={shippingAddress.city}
                                onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor="state" className="block text-gray-700 font-medium mb-2">
                                Bundesland *
                              </label>
                              <input
                                type="text"
                                id="state"
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                value={shippingAddress.state}
                                onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor="postalCode" className="block text-gray-700 font-medium mb-2">
                                Postleitzahl *
                              </label>
                              <input
                                type="text"
                                id="postalCode"
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                value={shippingAddress.postalCode}
                                onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                              <label htmlFor="country" className="block text-gray-700 font-medium mb-2">
                                Land *
                              </label>
                              <select
                                id="country"
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                value={shippingAddress.country}
                                onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                                required
                              >
                                <option value="US">Vereinigte Staaten</option>
                                <option value="CA">Kanada</option>
                                <option value="MX">Mexiko</option>
                                <option value="DE">Deutschland</option>
                                <option value="AT">Österreich</option>
                                <option value="CH">Schweiz</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                                Telefonnummer *
                              </label>
                              <input
                                type="tel"
                                id="phone"
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                value={shippingAddress.phone}
                                onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium transition-colors"
                            >
                              Weiter zur Zahlung
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Zahlungsmethode</h2>
                  <form onSubmit={handlePaymentSubmit}>
                    <div className="mb-6 space-y-4">
                      {/* Kreditkarte */}
                      <div className="border rounded-md p-4 hover:border-primary transition-colors">
                        <div className="flex items-center mb-2">
                          <input
                            type="radio"
                            id="creditCard"
                            name="paymentMethod"
                            value="credit_card"
                            className="h-5 w-5 text-primary focus:ring-primary"
                            checked={paymentMethod === 'credit_card'}
                            onChange={() => setPaymentMethod('credit_card')}
                          />
                          <label htmlFor="creditCard" className="ml-2 block text-gray-700 font-medium">
                            Kreditkarte
                          </label>
                        </div>
                        
                        {paymentMethod === 'credit_card' && (
                          <div className="pl-7 mt-4 space-y-4">
                            <div className="mb-4">
                              <label htmlFor="cardNumber" className="block text-gray-700 font-medium mb-2">
                                Kartennummer *
                              </label>
                              <input
                                type="text"
                                id="cardNumber"
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="1234 5678 9012 3456"
                                required={paymentMethod === 'credit_card'}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label htmlFor="expiryDate" className="block text-gray-700 font-medium mb-2">
                                  Gültig bis *
                                </label>
                                <input
                                  type="text"
                                  id="expiryDate"
                                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                  placeholder="MM/JJ"
                                  required={paymentMethod === 'credit_card'}
                                />
                              </div>
                              <div>
                                <label htmlFor="cvv" className="block text-gray-700 font-medium mb-2">
                                  CVV *
                                </label>
                                <input
                                  type="text"
                                  id="cvv"
                                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                  placeholder="123"
                                  required={paymentMethod === 'credit_card'}
                                />
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <label htmlFor="nameOnCard" className="block text-gray-700 font-medium mb-2">
                                Name auf der Karte *
                              </label>
                              <input
                                type="text"
                                id="nameOnCard"
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                required={paymentMethod === 'credit_card'}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* PayPal */}
                      <div className="border rounded-md p-4 hover:border-primary transition-colors">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="paypal"
                            name="paymentMethod"
                            value="paypal"
                            className="h-5 w-5 text-primary focus:ring-primary"
                            checked={paymentMethod === 'paypal'}
                            onChange={() => setPaymentMethod('paypal')}
                          />
                          <label htmlFor="paypal" className="ml-2 block text-gray-700 font-medium">
                            PayPal
                          </label>
                        </div>
                        {paymentMethod === 'paypal' && (
                          <div className="pl-7 mt-2">
                            <p className="text-gray-600">Sie werden zum Abschluss Ihrer Zahlung zu PayPal weitergeleitet.</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Klarna */}
                      <div className="border rounded-md p-4 hover:border-primary transition-colors">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="klarna"
                            name="paymentMethod"
                            value="klarna"
                            className="h-5 w-5 text-primary focus:ring-primary"
                            checked={paymentMethod === 'klarna'}
                            onChange={() => setPaymentMethod('klarna')}
                          />
                          <label htmlFor="klarna" className="ml-2 block text-gray-700 font-medium">
                            Klarna
                          </label>
                        </div>
                        {paymentMethod === 'klarna' && (
                          <div className="pl-7 mt-2">
                            <p className="text-gray-600">Bezahlen Sie bequem in Raten mit Klarna. Sie werden zur Bestätigung zu Klarna weitergeleitet.</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Nachnahme */}
                      <div className="border rounded-md p-4 hover:border-primary transition-colors">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="cashOnDelivery"
                            name="paymentMethod"
                            value="cash_on_delivery"
                            className="h-5 w-5 text-primary focus:ring-primary"
                            checked={paymentMethod === 'cash_on_delivery'}
                            onChange={() => setPaymentMethod('cash_on_delivery')}
                            disabled={deliveryMethod === 'pickup'}
                          />
                          <label htmlFor="cashOnDelivery" className={`ml-2 block ${deliveryMethod === 'pickup' ? 'text-gray-400' : 'text-gray-700'} font-medium`}>
                            Zahlung bei Lieferung (Nachnahme)
                          </label>
                        </div>
                        {paymentMethod === 'cash_on_delivery' && (
                          <div className="pl-7 mt-2">
                            <p className="text-gray-600">Zahlen Sie bei der Lieferung. Bitte halten Sie den genauen Betrag bereit.</p>
                          </div>
                        )}
                        {deliveryMethod === 'pickup' && (
                          <div className="pl-7 mt-2">
                            <p className="text-red-500 text-sm">Diese Option ist nur bei Lieferung verfügbar.</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <button
                        type="button"
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors"
                        onClick={() => setStep(1)}
                      >
                        Zurück zum Versand
                      </button>
                      <button
                        type="submit"
                        className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium transition-colors"
                      >
                        Bestellung überprüfen
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Bestellung überprüfen</h2>
                  
                  {deliveryMethod === 'shipping' && (
                    <div className="border-b border-gray-200 pb-4 mb-4">
                      <h3 className="font-semibold mb-2">Lieferadresse</h3>
                      <p className="text-gray-700">
                        {shippingAddress.firstName} {shippingAddress.lastName}<br />
                        {shippingAddress.address1}<br />
                        {shippingAddress.address2 && `${shippingAddress.address2}<br />`}
                        {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
                        {shippingAddress.country}<br />
                        {shippingAddress.phone}
                      </p>
                      <button
                        className="text-primary hover:text-primary/80 text-sm font-medium mt-2"
                        onClick={() => setStep(1)}
                      >
                        Bearbeiten
                      </button>
                    </div>
                  )}
                  
                  {deliveryMethod === 'pickup' && (
                    <div className="border-b border-gray-200 pb-4 mb-4">
                      <h3 className="font-semibold mb-2">Abholung im Geschäft</h3>
                      <p className="text-gray-700">
                        Sie holen Ihre Bestellung im Geschäft ab:<br />
                        {STORE_ADDRESS}<br />
                        Bitte bringen Sie einen Identitätsnachweis mit.
                      </p>
                      <button
                        className="text-primary hover:text-primary/80 text-sm font-medium mt-2"
                        onClick={() => setStep(1)}
                      >
                        Bearbeiten
                      </button>
                    </div>
                  )}
                  
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <h3 className="font-semibold mb-2">Zahlungsmethode</h3>
                    <p className="text-gray-700">
                      {paymentMethod === 'credit_card' && 'Kreditkarte (endet auf 3456)'}
                      {paymentMethod === 'paypal' && 'PayPal'}
                      {paymentMethod === 'klarna' && 'Klarna'}
                      {paymentMethod === 'cash_on_delivery' && 'Zahlung bei Lieferung (Nachnahme)'}
                    </p>
                    <button
                      className="text-primary hover:text-primary/80 text-sm font-medium mt-2"
                      onClick={() => setStep(2)}
                    >
                      Bearbeiten
                    </button>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <h3 className="font-semibold mb-2">Artikel</h3>
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between">
                          <div className="flex">
                            <span className="font-medium text-gray-700">{item.quantity} x</span>
                            <span className="ml-2 text-gray-700">{item.name}</span>
                          </div>
                          <span className="font-medium text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      type="button"
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors"
                      onClick={() => setStep(2)}
                      disabled={isProcessing}
                    >
                      Zurück zur Zahlung
                    </button>
                    <button
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center">
                          <span className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full"></span>
                          <span className="text-white">Bestellung wird verarbeitet...</span>
                        </div>
                      ) : (
                        'Bestellung absenden'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Bestellübersicht</h2>
              
              {/* Fehlerbenachrichtigung */}
              {error && (
                <div className="mt-4 p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
                  <p className="font-medium">Fehler</p>
                  <p>{error}</p>
                </div>
              )}
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Zwischensumme</span>
                  <span className="font-medium text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">MwSt. (19%)</span>
                  <span className="font-medium text-gray-800">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Versand</span>
                  <span className="font-medium text-gray-800">
                    {shipping === 0 ? 'Kostenlos' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <div className="text-xs text-primary italic">
                    Kostenlose Lieferung für Bestellungen über ${DELIVERY_THRESHOLD_2}
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg">
                  <span>Gesamtpreis</span>
                  <span className="text-gray-800">${total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                <p className="mb-2">
                  Durch das Absenden Ihrer Bestellung stimmen Sie unseren <a href="/agb" className="text-primary hover:text-primary/80">Allgemeinen Geschäftsbedingungen</a> und <a href="/datenschutz" className="text-primary hover:text-primary/80">Datenschutzbestimmungen</a> zu.
                </p>
                <p>
                  Eine Unterschrift eines Erwachsenen (21+) ist für alle Lieferungen erforderlich.
                </p>
                {deliveryMethod === 'pickup' && (
                  <p className="mt-2 font-medium">
                    Abholung: {STORE_ADDRESS}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
