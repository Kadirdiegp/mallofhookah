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
            
            // Versuche, Daten aus den user_metadata zu extrahieren
            const metadata = session.user.user_metadata;
            if (metadata) {
              console.log('Versuche, Daten aus user_metadata zu extrahieren:', metadata);
            }
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
            
          if (profileData || addressData || (session?.user?.user_metadata)) {
            // Daten für das Formular aufbereiten - speziell auf die Straße achten
            const metadata = session?.user?.user_metadata || {};
            
            const newShippingAddress = {
              firstName: (addressData?.first_name || profileData?.first_name || metadata.first_name || metadata.name || metadata.given_name || ''),
              lastName: (addressData?.last_name || profileData?.last_name || metadata.last_name || metadata.family_name || ''),
              // Straße könnte in unterschiedlichen Feldern gespeichert sein
              address1: (addressData?.street_address || addressData?.street || 
                       (profileData?.address_street ? profileData.address_street : 
                       (profileData?.address?.street ? profileData.address.street : 
                       (metadata.address?.street || metadata.street_address || '')))),
              address2: (addressData?.apartment || addressData?.apt || 
                       (profileData?.address_apt ? profileData.address_apt : 
                       (profileData?.address?.apt ? profileData.address.apt : 
                       (metadata.address?.apt || metadata.apartment || '')))),
              city: (addressData?.city || 
                    (profileData?.address_city ? profileData.address_city : 
                    (profileData?.address?.city ? profileData.address.city : 
                    (metadata.address?.city || metadata.city || '')))),
              state: (addressData?.state || 
                     (profileData?.address_state ? profileData.address_state : 
                     (profileData?.address?.state ? profileData.address.state : 
                     (metadata.address?.state || metadata.state || '')))),
              postalCode: (addressData?.postal_code || 
                          (profileData?.address_postal_code ? profileData.address_postal_code : 
                          (profileData?.address?.postalCode ? profileData.address.postalCode : 
                          (metadata.address?.postal_code || metadata.postal_code || metadata.zip_code || metadata.zip || '')))),
              country: (addressData?.country || 
                       (profileData?.address_country ? profileData.address_country : 
                       (profileData?.address?.country ? profileData.address.country : 
                       (metadata.address?.country || metadata.country || 'DE')))),
              phone: (addressData?.phone || profileData?.phone || metadata.phone || '')
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
  
  // Prüfen, ob kostenloser Versand möglich ist
  const canFreeShipping = 
    deliveryMethod === 'pickup' || 
    subtotal >= DELIVERY_THRESHOLD_2 || 
    (subtotal >= DELIVERY_THRESHOLD_1 && CLOSE_RADIUS_ZIP_CODES.includes(shippingAddress.postalCode));
  
  // Hilfsfunktion zum Anzeigen des Ländernamens
  const getCountryName = (countryCode: string): string => {
    const countries: Record<string, string> = {
      'DE': 'Deutschland',
      'AT': 'Österreich',
      'CH': 'Schweiz'
    };
    return countries[countryCode] || countryCode;
  };
  
  // Hilfsfunktion zum Anzeigen des Zahlungsmethodennamens
  const getPaymentMethodName = (method: PaymentMethod): string => {
    const methods: Record<PaymentMethod, string> = {
      'credit_card': 'Kreditkarte',
      'paypal': 'PayPal',
      'klarna': 'Klarna',
      'cash_on_delivery': 'Nachnahme'
    };
    return methods[method];
  };
  
  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-black rounded-lg shadow-md p-8 text-center border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-white">Ihr Warenkorb ist leer</h2>
          <p className="text-gray-400 mb-8">
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
    <div className="bg-black text-white min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-white">Checkout</h1>
        
        {/* Checkout Steps */}
        <div className="mb-8">
          <div className="flex justify-between">
            <div className={`flex-1 text-center pb-2 border-b-2 ${step >= 1 ? 'border-primary text-primary' : 'border-gray-700 text-gray-500'}`}>
              1. Versand
            </div>
            <div className={`flex-1 text-center pb-2 border-b-2 ${step >= 2 ? 'border-primary text-primary' : 'border-gray-700 text-gray-500'}`}>
              2. Zahlung
            </div>
            <div className={`flex-1 text-center pb-2 border-b-2 ${step >= 3 ? 'border-primary text-primary' : 'border-gray-700 text-gray-500'}`}>
              3. Überprüfen
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg shadow-md overflow-hidden border border-gray-800">
              {/* Step 1: Shipping */}
              {step === 1 && (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-6 text-white">Versandinformationen</h2>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3 text-white">Versandmethode</h3>
                        <div className="space-y-3">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="deliveryMethod"
                              value="shipping"
                              checked={deliveryMethod === 'shipping'}
                              onChange={() => setDeliveryMethod('shipping')}
                              className="h-5 w-5 text-primary focus:ring-primary focus:ring-offset-black"
                            />
                            <span className="ml-2 text-gray-300">Lieferung (DHL)</span>
                          </label>
                          
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="deliveryMethod"
                              value="pickup"
                              checked={deliveryMethod === 'pickup'}
                              onChange={() => setDeliveryMethod('pickup')}
                              className="h-5 w-5 text-primary focus:ring-primary focus:ring-offset-black"
                            />
                            <span className="ml-2 text-gray-300">Abholung im Geschäft</span>
                          </label>
                        </div>
                        
                        {deliveryMethod === 'pickup' && (
                          <div className="mt-4 p-4 bg-gray-900 rounded-md border border-gray-700">
                            <p className="font-medium text-white">Abholadresse:</p>
                            <p className="text-gray-400">{STORE_ADDRESS}</p>
                            <p className="text-gray-400 mt-2">
                              Bitte bringen Sie einen Identitätsnachweis mit, 
                              wenn Sie Ihre Bestellung abholen.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {deliveryMethod === 'shipping' && (
                        <form onSubmit={handleShippingSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label htmlFor="firstName" className="block text-gray-300 font-medium mb-2">
                                Vorname *
                              </label>
                              <input
                                type="text"
                                id="firstName"
                                className="w-full p-3 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={shippingAddress.firstName}
                                onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor="lastName" className="block text-gray-300 font-medium mb-2">
                                Nachname *
                              </label>
                              <input
                                type="text"
                                id="lastName"
                                className="w-full p-3 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={shippingAddress.lastName}
                                onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <label htmlFor="address1" className="block text-gray-300 font-medium mb-2">
                              Straße und Hausnummer *
                            </label>
                            <input
                              type="text"
                              id="address1"
                              className="w-full p-3 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              value={shippingAddress.address1}
                              onChange={(e) => setShippingAddress({...shippingAddress, address1: e.target.value})}
                              required
                            />
                          </div>
                          
                          <div className="mb-4">
                            <label htmlFor="address2" className="block text-gray-300 font-medium mb-2">
                              Adresszusatz
                            </label>
                            <input
                              type="text"
                              id="address2"
                              className="w-full p-3 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              value={shippingAddress.address2 || ''}
                              onChange={(e) => setShippingAddress({...shippingAddress, address2: e.target.value})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label htmlFor="postalCode" className="block text-gray-300 font-medium mb-2">
                                PLZ *
                              </label>
                              <input
                                type="text"
                                id="postalCode"
                                className="w-full p-3 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={shippingAddress.postalCode}
                                onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                                required
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label htmlFor="city" className="block text-gray-300 font-medium mb-2">
                                Stadt *
                              </label>
                              <input
                                type="text"
                                id="city"
                                className="w-full p-3 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={shippingAddress.city}
                                onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label htmlFor="state" className="block text-gray-300 font-medium mb-2">
                                Bundesland
                              </label>
                              <input
                                type="text"
                                id="state"
                                className="w-full p-3 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={shippingAddress.state || ''}
                                onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                              />
                            </div>
                            <div>
                              <label htmlFor="country" className="block text-gray-300 font-medium mb-2">
                                Land *
                              </label>
                              <select
                                id="country"
                                className="w-full p-3 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={shippingAddress.country}
                                onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                                required
                              >
                                <option value="DE">Deutschland</option>
                                <option value="AT">Österreich</option>
                                <option value="CH">Schweiz</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="mb-6">
                            <label htmlFor="phone" className="block text-gray-300 font-medium mb-2">
                              Telefon *
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              className="w-full p-3 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              value={shippingAddress.phone || ''}
                              onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                              required
                            />
                          </div>
                          
                          {error && (
                            <div className="mb-4 p-3 bg-red-900/70 text-white rounded-md border border-red-700">
                              {error}
                            </div>
                          )}
                          
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/80 transition-colors"
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <span className="flex items-center">
                                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Verarbeitung...
                                </span>
                              ) : (
                                'Weiter zur Zahlung'
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-6 text-white">Zahlungsinformationen</h2>
                  
                  <form onSubmit={handlePaymentSubmit}>
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3 text-white">Zahlungsmethode</h3>
                      <div className="space-y-3">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="credit_card"
                            checked={paymentMethod === 'credit_card'}
                            onChange={() => setPaymentMethod('credit_card')}
                            className="h-5 w-5 text-primary focus:ring-primary focus:ring-offset-black"
                          />
                          <span className="ml-2 text-gray-300">Kreditkarte</span>
                        </label>
                        
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="paypal"
                            checked={paymentMethod === 'paypal'}
                            onChange={() => setPaymentMethod('paypal')}
                            className="h-5 w-5 text-primary focus:ring-primary focus:ring-offset-black"
                          />
                          <span className="ml-2 text-gray-300">PayPal</span>
                        </label>
                        
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="klarna"
                            checked={paymentMethod === 'klarna'}
                            onChange={() => setPaymentMethod('klarna')}
                            className="h-5 w-5 text-primary focus:ring-primary focus:ring-offset-black"
                          />
                          <span className="ml-2 text-gray-300">Klarna</span>
                        </label>
                        
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cash_on_delivery"
                            checked={paymentMethod === 'cash_on_delivery'}
                            onChange={() => setPaymentMethod('cash_on_delivery')}
                            className="h-5 w-5 text-primary focus:ring-primary focus:ring-offset-black"
                          />
                          <span className="ml-2 text-gray-300">Nachnahme</span>
                        </label>
                      </div>
                    </div>
                    
                    {paymentMethod === 'credit_card' && (
                      <div className="space-y-4 mb-6">
                        <div>
                          <label htmlFor="cardName" className="block text-gray-300 font-medium mb-2">
                            Name auf der Karte *
                          </label>
                          <input
                            type="text"
                            id="cardName"
                            className="w-full p-3 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="cardNumber" className="block text-gray-300 font-medium mb-2">
                            Kartennummer *
                          </label>
                          <input
                            type="text"
                            id="cardNumber"
                            className="w-full p-3 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="1234 5678 9012 3456"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="expiration" className="block text-gray-300 font-medium mb-2">
                              Ablaufdatum *
                            </label>
                            <input
                              type="text"
                              id="expiration"
                              className="w-full p-3 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="MM/YY"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="cvv" className="block text-gray-300 font-medium mb-2">
                              CVV *
                            </label>
                            <input
                              type="text"
                              id="cvv"
                              className="w-full p-3 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="123"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {error && (
                      <div className="mb-4 p-3 bg-red-900/70 text-white rounded-md border border-red-700">
                        {error}
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <button
                        type="button"
                        className="px-6 py-3 border border-gray-700 text-gray-300 font-medium rounded-md hover:bg-gray-900 transition-colors"
                        onClick={() => setStep(1)}
                      >
                        Zurück
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/80 transition-colors"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verarbeitung...
                          </span>
                        ) : (
                          'Bestellung überprüfen'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Step 3: Review */}
              {step === 3 && (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-6 text-white">Bestellübersicht</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3 text-primary">Versandinformationen</h3>
                      <div className="bg-gray-900 p-4 rounded-md border border-gray-700">
                        {deliveryMethod === 'pickup' ? (
                          <div>
                            <p className="font-medium text-white">Abholung im Geschäft</p>
                            <p className="text-gray-400">{STORE_ADDRESS}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-white">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                            <p className="text-gray-400">{shippingAddress.address1}</p>
                            {shippingAddress.address2 && <p className="text-gray-400">{shippingAddress.address2}</p>}
                            <p className="text-gray-400">{shippingAddress.postalCode} {shippingAddress.city}</p>
                            {shippingAddress.state && <p className="text-gray-400">{shippingAddress.state}</p>}
                            <p className="text-gray-400">{getCountryName(shippingAddress.country)}</p>
                            <p className="text-gray-400">{shippingAddress.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3 text-primary">Zahlungsinformationen</h3>
                      <div className="bg-gray-900 p-4 rounded-md border border-gray-700">
                        <p className="font-medium text-white">{getPaymentMethodName(paymentMethod)}</p>
                        {paymentMethod === 'credit_card' && (
                          <p className="text-gray-400">**** **** **** 1234</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3 text-primary">Bestellte Artikel</h3>
                      <div className="bg-gray-900 rounded-md border border-gray-700 divide-y divide-gray-700">
                        {items.map((item) => (
                          <div key={item.id} className="p-4 flex items-center">
                            <div className="w-16 h-16 bg-black flex-shrink-0 mr-4">
                              <img
                                src={item.image || '/images/product-placeholder.jpg'}
                                alt={item.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-medium text-white">{item.name}</h4>
                              <div className="flex justify-between text-sm text-gray-400">
                                <span>Menge: {item.quantity}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="my-4 p-3 bg-red-900/70 text-white rounded-md border border-red-700">
                      {error}
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      className="px-6 py-3 border border-gray-700 text-gray-300 font-medium rounded-md hover:bg-gray-900 transition-colors"
                      onClick={() => setStep(2)}
                    >
                      Zurück
                    </button>
                    <button
                      type="button"
                      className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/80 transition-colors"
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Bestellung wird aufgegeben...
                        </span>
                      ) : (
                        'Bestellung aufgeben'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-black rounded-lg shadow-md p-6 sticky top-24 border border-gray-800">
              <h2 className="text-xl font-bold mb-6 text-white">Zusammenfassung</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Zwischensumme</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Versand</span>
                  <span className="text-white">
                    {deliveryMethod === 'pickup' ? (
                      'Kostenlos'
                    ) : (
                      canFreeShipping ? 'Kostenlos' : `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Steuern (19%)</span>
                  <span className="text-white">${tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-800 pt-4 flex justify-between font-bold">
                  <span className="text-white">Gesamtsumme</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
              
              {deliveryMethod === 'shipping' && !canFreeShipping && (
                <div className="mb-6 p-3 bg-gray-900 rounded-md border border-gray-700 text-sm text-gray-400">
                  <p>
                    {shippingAddress.postalCode && CLOSE_RADIUS_ZIP_CODES.includes(shippingAddress.postalCode) ? (
                      <>Kostenloser Versand ab ${DELIVERY_THRESHOLD_1.toFixed(2)}. Fügen Sie ${(DELIVERY_THRESHOLD_1 - subtotal).toFixed(2)} hinzu, um kostenlosen Versand zu erhalten.</>
                    ) : (
                      <>Kostenloser Versand ab ${DELIVERY_THRESHOLD_2.toFixed(2)}. Fügen Sie ${(DELIVERY_THRESHOLD_2 - subtotal).toFixed(2)} hinzu, um kostenlosen Versand zu erhalten.</>
                    )}
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Wir akzeptieren</h3>
                <div className="flex space-x-2">
                  <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-400">VISA</div>
                  <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-400">MC</div>
                  <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-400">AMEX</div>
                  <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-400">PP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
