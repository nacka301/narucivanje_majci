document.addEventListener('DOMContentLoaded', function() {
    // Sakrij modal na početak
    const thankYouContainer = document.getElementById('thankYouContainer');
    thankYouContainer.classList.add('hidden');
    
    const orderForm = document.getElementById('orderForm');
    const notification = document.getElementById('notification');
    const notificationMessage = document.querySelector('.notification-message');
    const notificationClose = document.querySelector('.notification-close');
    const orderButton = document.querySelector('.order-button');
    const quantitySelect = document.getElementById('kolicina');
    
    // Ažuriranje cene na osnovu količine
    quantitySelect.addEventListener('change', function() {
        const quantity = parseInt(this.value);
        const totalPrice = quantity * 25;
        orderButton.textContent = `Naruči majicu (${totalPrice}€)`;
    });

    // Ažuriranje slike na osnovu veličine
    const sizeSelect = document.getElementById('velicina');
    const productImage = document.getElementById('productImage');
    
    sizeSelect.addEventListener('change', function() {
        const size = this.value;
        if (size) {
            // Možete imati različite slike za različite veličine
            // productImage.src = `images/sinj-majica-${size.toLowerCase()}.jpg`;
            
            // Ili dodajte animaciju kad se promeni veličina
            productImage.style.transform = 'scale(1.1)';
            setTimeout(() => {
                productImage.style.transform = 'scale(1)';
            }, 200);
        }
    });

    // Zatvaranje notifikacije
    notificationClose.addEventListener('click', function() {
        hideNotification();
    });

    // Automatsko zatvaranje notifikacije nakon 5 sekundi
    let notificationTimeout;

    function showNotification(message, isError = false) {
        notificationMessage.textContent = message;
        notification.classList.remove('hidden');
        
        if (isError) {
            notification.classList.add('error');
        } else {
            notification.classList.remove('error');
        }

        // Automatsko zatvaranje
        clearTimeout(notificationTimeout);
        notificationTimeout = setTimeout(() => {
            hideNotification();
        }, 5000);
    }

    function hideNotification() {
        notification.classList.add('hidden');
        clearTimeout(notificationTimeout);
    }

    // Validacija forme
    function validateForm(formData) {
        const required = ['ime', 'prezime', 'email', 'telefon', 'adresa', 'grad', 'postanskiBroj', 'velicina', 'kolicina'];
        const missing = [];

        for (let field of required) {
            if (!formData.get(field) || formData.get(field).trim() === '') {
                missing.push(field);
            }
        }

        if (missing.length > 0) {
            return {
                valid: false,
                message: 'Molimo popunite sva obavezna polja: ' + missing.join(', ')
            };
        }

        // Validacija email-a
        const email = formData.get('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                valid: false,
                message: 'Molimo unesite valjan email'
            };
        }

        // Validacija telefona
        const telefon = formData.get('telefon');
        const telefonRegex = /^[+]?[\d\s-()]{8,15}$/;
        if (!telefonRegex.test(telefon)) {
            return {
                valid: false,
                message: 'Molimo unesite valjan broj telefona'
            };
        }

        return { valid: true };
    }

    // Slanje forme
    orderForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const validation = validateForm(formData);
        
        if (!validation.valid) {
            showNotification(validation.message, true);
            return;
        }

        // Blokiranje dugmeta tokom slanja
        orderButton.disabled = true;
        orderButton.textContent = 'Šalje se...';

        try {
            const response = await fetch('/api/naruci', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Prikaži hvala modal
                showThankYouSection(result.narudba);
                orderForm.reset();
                orderButton.textContent = 'Naruči majicu (25€)';
                
                console.log('Narudžba uspešno poslata:', result.narudba);
            } else {
                showNotification(result.message || 'Došlo je do greške. Pokušajte ponovo.', true);
            }
        } catch (error) {
            console.error('Greška pri slanju narudžbe:', error);
            showNotification('Došlo je do greške. Provjerite internetsku vezu i pokušajte ponovo.', true);
        } finally {
            orderButton.disabled = false;
            const quantity = parseInt(quantitySelect.value) || 1;
            const totalPrice = quantity * 25;
            orderButton.textContent = `Naruči majicu (${totalPrice}€)`;
        }
    });

    // Funkcija za prikazivanje hvala sekcije kao modal
    function showThankYouSection(orderData) {
        const thankYouContainer = document.getElementById('thankYouContainer');
        const orderDetails = document.getElementById('orderDetails');
        const container = document.querySelector('.container');
        
        // Prikaži modal
        thankYouContainer.classList.remove('hidden');
        
        // Popuni detalje narudžbe
        orderDetails.innerHTML = `
            <h3>📋 Detalji narudžbe:</h3>
            <div class="order-detail-item">
                <span>Narudžba broj:</span>
                <span>#${orderData.id}</span>
            </div>
            <div class="order-detail-item">
                <span>Ime:</span>
                <span>${orderData.ime} ${orderData.prezime}</span>
            </div>
            <div class="order-detail-item">
                <span>Email:</span>
                <span>${orderData.email}</span>
            </div>
            <div class="order-detail-item">
                <span>Veličina:</span>
                <span>${orderData.velicina}</span>
            </div>
            <div class="order-detail-item">
                <span>Količina:</span>
                <span>${orderData.kolicina} kom</span>
            </div>
            <div class="order-detail-item">
                <span>Ukupno:</span>
                <span>${orderData.ukupnaCena}€</span>
            </div>
        `;
        
        // Spreci scroll na pozadini
        document.body.style.overflow = 'hidden';
    }
    
    // Funkcija za zatvaranje modal-a (globalna za onclick)
    window.showOrderForm = function() {
        const thankYouContainer = document.getElementById('thankYouContainer');
        
        // Sakrij modal
        thankYouContainer.classList.add('hidden');
        
        // Vrati scroll na pozadini
        document.body.style.overflow = 'auto';
    };
    
    // Zatvaranje modal-a klikom na pozadinu ili escape
    document.addEventListener('click', function(e) {
        const thankYouContainer = document.getElementById('thankYouContainer');
        const thankYouContent = document.querySelector('.thank-you-content');
        
        if (e.target === thankYouContainer && !thankYouContainer.classList.contains('hidden')) {
            showOrderForm();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        const thankYouContainer = document.getElementById('thankYouContainer');
        
        if (e.key === 'Escape' && !thankYouContainer.classList.contains('hidden')) {
            showOrderForm();
        }
    });

    // Zatvaranje modal-a klikom na pozadinu
    document.addEventListener('click', function(e) {
        const thankYouContainer = document.getElementById('thankYouContainer');
        if (e.target === thankYouContainer) {
            showOrderForm();
        }
    });

    // Zatvaranje modal-a pritiskom na Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const thankYouContainer = document.getElementById('thankYouContainer');
            if (!thankYouContainer.classList.contains('hidden')) {
                showOrderForm();
            }
        }
    });

    // Formatting telefona tokom kucanja
    document.getElementById('telefon').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.startsWith('385')) {
                value = '+385 ' + value.slice(3);
            } else if (value.startsWith('0')) {
                value = '+385 ' + value.slice(1);
            }
        }
        e.target.value = value;
    });

    // Formatting poštanskog broja
    document.getElementById('postanskiBroj').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
    });

    // Animacija za form polja
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });
    });
});
