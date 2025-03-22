import { supabase } from '../services/supabase';

// Create a more flexible shipping address type for email
interface EmailShippingAddress {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  shipping_name?: string;
  shipping_street?: string;
  shipping_apartment?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  shipping_phone?: string;
}

// Typen für die E-Mail-Benachrichtigung
interface OrderConfirmationEmailData {
  orderId: string;
  userEmail: string;
  userName: string;
  orderItems: Array<{
    product_id: string;
    quantity: number;
    price_per_unit: number;
    total_price: number;
    product_name?: string;
    product_image?: string;
  }>;
  total: number;
  subtotal: number;
  shipping: number;
  paymentMethod: string;
  deliveryMethod: string;
  shippingAddress?: EmailShippingAddress;
}

/**
 * Sendet eine Bestellbestätigungs-E-Mail an den Kunden
 * 
 * In einer echten Implementierung würde diese Funktion:
 * 1. Eine Vorlage aus einer E-Mail-Vorlagenbibliothek verwenden
 * 2. Die Daten in die Vorlage einfügen
 * 3. Die E-Mail über einen E-Mail-Dienst wie SendGrid, Mailgun oder Amazon SES senden
 */
export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData): Promise<boolean> {
  try {
    console.log('Sende Bestellbestätigungs-E-Mail an:', data.userEmail);
    
    // In einer echten Implementierung würde hier der E-Mail-Versand stattfinden
    // Beispiel mit Supabase-Bucket zum Speichern der E-Mail (für Demo-Zwecke)
    const emailContent = generateEmailContent(data);
    
    // Speichern Sie die E-Mail in einem Supabase-Bucket oder rufen Sie einen externen E-Mail-Service auf
    // Hier nur ein Beispiel/Mockup:
    const { error } = await supabase
      .from('email_logs')
      .insert({
        user_id: data.userEmail,
        email_type: 'order_confirmation',
        order_id: data.orderId,
        content: emailContent,
        status: 'sent',
        sent_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Fehler beim Protokollieren der E-Mail:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Fehler beim Senden der Bestätigungs-E-Mail:', error);
    return false;
  }
}

/**
 * Generiert den Inhalt der E-Mail
 */
function generateEmailContent(data: OrderConfirmationEmailData): string {
  // In einer echten Implementierung würde hier eine HTML-Vorlage verwendet werden
  return `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
        .order-details { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
        .footer { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #4a6cf7; color: white; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Vielen Dank für Ihre Bestellung!</h1>
          <p>Bestellnummer: ${data.orderId}</p>
        </div>
        
        <p>Hallo ${data.userName},</p>
        
        <p>Wir freuen uns, Ihnen mitteilen zu können, dass wir Ihre Bestellung erhalten haben. 
           Hier ist eine Zusammenfassung Ihrer Bestellung:</p>
        
        <div class="order-details">
          <h3>Bestellübersicht</h3>
          <table>
            <tr>
              <th>Produkt</th>
              <th>Menge</th>
              <th>Preis</th>
              <th>Gesamt</th>
            </tr>
            ${data.orderItems.map(item => `
              <tr>
                <td>${item.product_id || 'Unbekanntes Produkt'}</td>
                <td>${item.quantity || 0}</td>
                <td>${(item.price_per_unit ? item.price_per_unit.toFixed(2) : '0.00')} €</td>
                <td>${(item.total_price ? item.total_price.toFixed(2) : '0.00')} €</td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="3" style="text-align: right;"><strong>Zwischensumme:</strong></td>
              <td>${(data.subtotal ? data.subtotal.toFixed(2) : '0.00')} €</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right;"><strong>Versand:</strong></td>
              <td>${(data.shipping ? data.shipping.toFixed(2) : '0.00')} €</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right;"><strong>Gesamtsumme:</strong></td>
              <td>${(data.total ? data.total.toFixed(2) : '0.00')} €</td>
            </tr>
          </table>
        </div>
        
        <div class="payment-shipping">
          <h3>Zahlungs- und Versandinformationen</h3>
          <p><strong>Zahlungsmethode:</strong> ${formatPaymentMethod(data.paymentMethod)}</p>
          <p><strong>Liefermethode:</strong> ${data.deliveryMethod === 'shipping' ? 'Versand' : 'Abholung im Geschäft'}</p>
          
          ${data.shippingAddress ? `
          <h3>Lieferadresse</h3>
          <p>
            ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}<br>
            ${data.shippingAddress.address1}<br>
            ${data.shippingAddress.address2 ? `${data.shippingAddress.address2}<br>` : ''}
            ${data.shippingAddress.postalCode} ${data.shippingAddress.city}<br>
            ${data.shippingAddress.country}
          </p>
          ` : ''}
        </div>
        
        <p>Sie können den Status Ihrer Bestellung jederzeit in Ihrem Konto verfolgen.</p>
        
        <p style="text-align: center;">
          <a href="https://www.mallofhookah.de/profile" class="button">Mein Konto</a>
        </p>
        
        <p>Bei Fragen zu Ihrer Bestellung stehen wir Ihnen gerne zur Verfügung.</p>
        
        <p>Mit freundlichen Grüßen,<br>Ihr Mall of Hookah Team</p>
        
        <div class="footer">
          <p>Mall of Hookah GmbH | Gröpelinger Heerstraße 214A, 28237 Bremen | +49 (0)421 123456</p>
          <p>© ${new Date().getFullYear()} Mall of Hookah GmbH. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Formatiert die Zahlungsmethode für die E-Mail
 */
function formatPaymentMethod(method: string): string {
  switch (method) {
    case 'credit_card':
      return 'Kreditkarte';
    case 'paypal':
      return 'PayPal';
    case 'klarna':
      return 'Klarna';
    case 'cash_on_delivery':
      return 'Nachnahme';
    default:
      return method;
  }
}
