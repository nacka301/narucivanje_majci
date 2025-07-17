document.addEventListener('DOMContentLoaded', function() {
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
                showNotification('Narudžba je uspešno poslata! Kontaktirat ćemo vas uskoro.');
                orderForm.reset();
                orderButton.textContent = 'Naruči majicu (25€)';
                
                // Prikazivanje detalja narudžbe u konzoli
                console.log('Narudžba uspešno poslata:', result.narudba);
            } else {
                showNotification(result.message || 'Došlo je do greške. Pokušajte ponovo.', true);
            }
        } catch (error) {
            console.error('Greška pri slanju narudžbe:', error);
            showNotification('Došlo je do greške. Proverite internetsku vezu i pokušajte ponovo.', true);
        } finally {
            orderButton.disabled = false;
            const quantity = parseInt(quantitySelect.value) || 1;
            const totalPrice = quantity * 25;
            orderButton.textContent = `Naruči majicu (${totalPrice}€)`;
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
