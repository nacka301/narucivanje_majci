const nodemailer = require('nodemailer');

// Email konfiguracija
const emailConfig = {
    // Custom SMTP server
    smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    }
};

// Kreiranje transporter-a
const createTransporter = () => {
    console.log('Kreiram transporter sa SMTP postavkama:', {
        host: emailConfig.smtp.host,
        port: emailConfig.smtp.port,
        user: emailConfig.smtp.auth.user,
        secure: emailConfig.smtp.secure,
        tls: emailConfig.smtp.tls
    });
    return nodemailer.createTransport(emailConfig.smtp);
};

// Funkcija za slanje email-a korisniku
const sendOrderConfirmation = async (narudba) => {
    const transporter = createTransporter();
    console.log('Pokušavam poslati email korisniku na:', narudba.email);
    
    const mailOptions = {
        from: '"Sinj x Thompson" <vpsolutions.booking@gmail.com>',
        to: narudba.email,
        subject: '✅ Potvrda narudžbe - Sinj x Thompson Majica',
        replyTo: 'vpsolutions.booking@gmail.com',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">Sinj x Thompson</h1>
                <p style="margin: 10px 0 0 0;">Hvala vam na narudžbi!</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
                <h2 style="color: #333; margin-top: 0;">Vaša narudžba je uspešno primljena</h2>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Detalji narudžbe:</h3>
                    <p><strong>Broj narudžbe:</strong> #${narudba.id}</p>
                    <p><strong>Datum:</strong> ${new Date(narudba.datum).toLocaleDateString('sr-RS')}</p>
                    <p><strong>Proizvod:</strong> Sinj x Thompson Majica</p>
                    <p><strong>Veličina:</strong> ${narudba.velicina}</p>
                    <p><strong>Količina:</strong> ${narudba.kolicina}</p>
                    <p><strong>Ukupna cena:</strong> ${narudba.ukupnaCena}€</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Adresa dostave:</h3>
                    <p><strong>${narudba.ime} ${narudba.prezime}</strong></p>
                    <p>${narudba.adresa}</p>
                    <p>${narudba.postanskiBroj} ${narudba.grad}</p>
                    <p><strong>Telefon:</strong> ${narudba.telefon}</p>
                </div>
                
                ${narudba.napomena ? `
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Napomena:</h3>
                    <p>${narudba.napomena}</p>
                </div>
                ` : ''}
                
                <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #2d5a2d; margin-top: 0;">🎯 Sledeći koraci:</h3>
                    <p style="margin: 8px 0;">✅ Vaša narudžba je uspešno primljena</p>
                    <p style="margin: 8px 0;">📞 Kontaktiraćemo vas u roku od 24 sata</p>
                    <p style="margin: 8px 0;">🚚 Dostava se vrši u roku od 7-14 radnih dana</p>
                    <p style="margin: 8px 0;">💰 Plaćanje pouzećem ili uplatom na račun</p>
                    <p style="margin: 8px 0;"><strong>⚠️ Proverite spam folder ako ne vidite ovaj email!</strong></p>
                </div>
                
                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
                    <h3 style="color: #856404; margin-top: 0;">💡 Važne informacije:</h3>
                    <p style="margin: 8px 0; color: #856404;">• Besplatna dostava po cijeloj Hrvatskoj</p>
                    <p style="margin: 8px 0; color: #856404;">• Majica je 100% pamuk, vrhunska kvaliteta</p>
                    <p style="margin: 8px 0; color: #856404;">• Mogućnost povrata u roku od 14 dana</p>
                    <p style="margin: 8px 0; color: #856404;">• Sačuvajte ovaj email kao potvrdu narudžbe</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <p style="color: #666;">Za sva pitanja ili pomoć kontaktirajte:</p>
                    <p><strong>📧 Email:</strong> vpsolutions.booking@gmail.com</p>
                    <p><strong>👤 Kontakt osoba:</strong> Patrik Kos</p>
                    <p><strong>📞 Telefon:</strong> +385 99 264 3964</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="color: #999; font-size: 12px; margin: 5px 0;">
                        © 2025 Sinj x Thompson. Sva prava zadržana.
                    </p>
                    <p style="color: #999; font-size: 12px; margin: 5px 0;">
                        Hvala vam što ste odabrali naše proizvode! 🇭🇷
                    </p>
                </div>
            </div>
        </div>
        `
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email poslat korisniku:', info.messageId, info.response);
        return { success: true, messageId: info.messageId, response: info.response };
    } catch (error) {
        console.error('Greška pri slanju email-a korisniku:', error);
        if (error && error.response) {
            console.error('Odgovor SMTP servera:', error.response);
        }
        if (error && error.code) {
            console.error('SMTP error code:', error.code);
        }
        if (error && error.command) {
            console.error('SMTP command:', error.command);
        }
        return { success: false, error: error.message, code: error.code, command: error.command, full: error };
    }
};

// Funkcija za slanje notifikacije adminu
const sendAdminNotification = async (narudba) => {
    const transporter = createTransporter();
    console.log('Pokušavam poslati email adminu na:', mailOptions.to);
    
    const mailOptions = {
        from: 'vpsolutions.booking@gmail.com',
        to: process.env.ADMIN_EMAIL || 'admin@sinjthompson.com',
        subject: `Nova narudžba #${narudba.id} - Sinj x Thompson`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">Nova narudžba!</h1>
                <p style="margin: 10px 0 0 0;">Narudžba #${narudba.id}</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
                <h2 style="color: #333; margin-top: 0;">Detalji narudžbe</h2>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Proizvod:</h3>
                    <p><strong>Majica:</strong> Sinj x Thompson</p>
                    <p><strong>Veličina:</strong> ${narudba.velicina}</p>
                    <p><strong>Količina:</strong> ${narudba.kolicina}</p>
                    <p><strong>Cena:</strong> ${narudba.ukupnaCena}€</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Kupac:</h3>
                    <p><strong>Ime:</strong> ${narudba.ime} ${narudba.prezime}</p>
                    <p><strong>Email:</strong> ${narudba.email}</p>
                    <p><strong>Telefon:</strong> ${narudba.telefon}</p>
                    <p><strong>Adresa:</strong> ${narudba.adresa}</p>
                    <p><strong>Grad:</strong> ${narudba.grad} ${narudba.postanskiBroj}</p>
                </div>
                
                ${narudba.napomena ? `
                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #856404; margin-top: 0;">Napomena:</h3>
                    <p>${narudba.napomena}</p>
                </div>
                ` : ''}
                
                <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #155724; margin-top: 0;">Akcije:</h3>
                    <p>• Kontaktirajte kupca na: ${narudba.telefon}</p>
                    <p>• Pripremite majicu veličine ${narudba.velicina}</p>
                    <p>• Organizujte dostavu na adresu</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <p style="color: #666;">Narudžba primljena: ${new Date(narudba.datum).toLocaleString('sr-RS')}</p>
                </div>
            </div>
        </div>
        `
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email poslat adminu:', info.messageId, info.response);
        return { success: true, messageId: info.messageId, response: info.response };
    } catch (error) {
        console.error('Greška pri slanju email-a adminu:', error);
        if (error && error.response) {
            console.error('Odgovor SMTP servera:', error.response);
        }
        if (error && error.code) {
            console.error('SMTP error code:', error.code);
        }
        if (error && error.command) {
            console.error('SMTP command:', error.command);
        }
        return { success: false, error: error.message, code: error.code, command: error.command, full: error };
    }
};

module.exports = {
    sendOrderConfirmation,
    sendAdminNotification
};
