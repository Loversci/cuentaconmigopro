/**
 * CuentaConmigo Pro - Script principal con EmailJS
 * Autor: Diseño profesional
 * Versión: 3.0 - Con captura de leads
 */

(function() {
    'use strict';

    // ===== CONFIGURACIÓN DE EMAILJS =====
    // IMPORTANTE: Debes configurar tu cuenta en EmailJS
    // 1. Crea una cuenta gratis en https://www.emailjs.com/
    // 2. Conecta un servicio de correo (Gmail, Outlook, etc.)
    // 3. Crea una plantilla con las variables: nombre, email, empresa, telefono, mensaje
    // 4. Reemplaza estas variables con tus IDs reales
    
    const EMAILJS_CONFIG = {
        PUBLIC_KEY: '1Ns-UpKGL6O8NHR8d',      // Tu Public Key de EmailJS
        SERVICE_ID: 'service_w7cgg7h',      // ID del servicio que creaste
        TEMPLATE_ID: 'template_ak134ao'     // ID de la plantilla
    };

    // ===== MENÚ HAMBURGUESA MÓVIL =====
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            
            const spans = this.querySelectorAll('span');
            if (this.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // ===== SMOOTH SCROLL PARA ENLACES INTERNOS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ===== INICIALIZAR EMAILJS =====
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        console.log('EmailJS inicializado correctamente');
    } else {
        console.warn('EmailJS no está cargado. Verifica que el script esté incluido.');
    }

    // ===== FORMULARIO DE CONTACTO CON EMAILJS =====
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        const nombreInput = document.getElementById('nombre');
        const emailInput = document.getElementById('email');
        const empresaInput = document.getElementById('empresa');
        const telefonoInput = document.getElementById('telefono');
        const mensajeInput = document.getElementById('mensaje');
        const formStatus = document.getElementById('formStatus');
        const submitBtn = contactForm.querySelector('button[type="submit"]');

        // Función de validación mejorada
        function validateForm() {
            let isValid = true;
            
            // Validar nombre
            if (!nombreInput.value.trim()) {
                showError(nombreInput, 'El nombre es obligatorio');
                isValid = false;
            } else if (nombreInput.value.trim().length < 2) {
                showError(nombreInput, 'El nombre debe tener al menos 2 caracteres');
                isValid = false;
            } else {
                clearError(nombreInput);
            }
            
            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput.value.trim()) {
                showError(emailInput, 'El email es obligatorio');
                isValid = false;
            } else if (!emailRegex.test(emailInput.value.trim())) {
                showError(emailInput, 'Email inválido (ej: nombre@empresa.com)');
                isValid = false;
            } else {
                clearError(emailInput);
            }

            // Validar teléfono (opcional pero con formato)
            if (telefonoInput.value.trim()) {
                const phoneRegex = /^[0-9+\-\s()]{8,20}$/;
                if (!phoneRegex.test(telefonoInput.value.trim())) {
                    showError(telefonoInput, 'Teléfono inválido');
                    isValid = false;
                } else {
                    clearError(telefonoInput);
                }
            }
            
            return isValid;
        }

        function showError(input, message) {
            const formGroup = input.closest('.form-group');
            formGroup.classList.add('error');
            const errorSpan = formGroup.querySelector('.error-message');
            if (errorSpan) {
                errorSpan.textContent = message;
            }
        }

        function clearError(input) {
            const formGroup = input.closest('.form-group');
            formGroup.classList.remove('error');
            const errorSpan = formGroup.querySelector('.error-message');
            if (errorSpan) {
                errorSpan.textContent = '';
            }
        }

        // Limpiar errores al escribir
        [nombreInput, emailInput, telefonoInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => clearError(input));
            }
        });

        // Envío del formulario con EmailJS
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validar formulario
            if (!validateForm()) {
                if (formStatus) {
                    formStatus.textContent = 'Por favor corrige los errores';
                    formStatus.className = 'form-status error';
                }
                return;
            }

            // Deshabilitar botón durante el envío
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            }

            // Mostrar estado de envío
            if (formStatus) {
                formStatus.textContent = 'Enviando mensaje...';
                formStatus.className = 'form-status';
            }

            try {
                // Preparar los datos para EmailJS
                const templateParams = {
                    from_name: nombreInput.value.trim(),
                    from_email: emailInput.value.trim(),
                    empresa: empresaInput ? empresaInput.value.trim() : 'No especificada',
                    telefono: telefonoInput ? telefonoInput.value.trim() : 'No especificado',
                    message: mensajeInput ? mensajeInput.value.trim() : 'Sin mensaje',
                    to_name: 'Equipo CuentaConmigo Pro',
                    reply_to: emailInput.value.trim()
                };

                // Verificar que EmailJS está disponible
                if (typeof emailjs === 'undefined') {
                    throw new Error('EmailJS no está cargado');
                }

                // Enviar usando EmailJS
                const response = await emailjs.send(
                    EMAILJS_CONFIG.SERVICE_ID,
                    EMAILJS_CONFIG.TEMPLATE_ID,
                    templateParams
                );

                console.log('Email enviado exitosamente:', response);

                // Mostrar mensaje de éxito
                if (formStatus) {
                    formStatus.textContent = '✅ ¡Mensaje enviado! Te contactaremos en menos de 24h.';
                    formStatus.className = 'form-status success';
                }

                // Resetear formulario
                contactForm.reset();

            } catch (error) {
                console.error('Error al enviar email:', error);
                
                // Mensaje de error amigable
                let errorMessage = 'Error al enviar. ';
                if (error.status === 0 || error.message?.includes('network')) {
                    errorMessage += 'Verifica tu conexión a internet.';
                } else if (error.status === 401 || error.status === 403) {
                    errorMessage += 'Error de autenticación con EmailJS.';
                } else {
                    errorMessage += 'Por favor intenta nuevamente.';
                }

                if (formStatus) {
                    formStatus.textContent = `❌ ${errorMessage}`;
                    formStatus.className = 'form-status error';
                }

            } finally {
                // Re-habilitar botón
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar solicitud';
                }

                // Limpiar mensaje de éxito después de 7 segundos
                if (formStatus && formStatus.classList.contains('success')) {
                    setTimeout(() => {
                        formStatus.textContent = '';
                    }, 7000);
                }
            }
        });
    }

    // ===== ANIMACIONES AL HACER SCROLL =====
    const animatedElements = document.querySelectorAll('.service-card, .step-item, .testimonial-card, .stat-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-up');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));

    // ===== MANEJO DE ERROR DE CARGA DEL LOGO =====
    const logoImg = document.getElementById('logoImg');
    if (logoImg) {
        logoImg.onerror = function() {
            this.style.display = 'none';
            const fallback = document.createElement('span');
            fallback.className = 'logo-fallback';
            fallback.textContent = 'CuentaConmigo Pro';
            fallback.style.cssText = 'font-weight:700; font-size:1.5rem; color:var(--azul-oscuro);';
            this.parentNode.appendChild(fallback);
        };
    }

    // ===== DETECCIÓN DE CONFIGURACIÓN =====
    if (EMAILJS_CONFIG.PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
        console.warn('⚠️ EmailJS no configurado. Reemplaza las variables en script.js con tus credenciales.');
        if (formStatus) {
            formStatus.textContent = 'Nota: Configura EmailJS para recibir mensajes.';
            formStatus.className = 'form-status';
        }
    }
})();

