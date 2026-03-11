/**
 * CuentaConmigo Pro - Script principal
 * Autor: Diseño profesional
 * Versión: 2.0
 */

(function() {
    'use strict';

    // ===== MENÚ HAMBURGUESA MÓVIL =====
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            
            // Animación del icono hamburguesa
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

        // Cerrar menú al hacer clic en un enlace
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

    // ===== FORMULARIO DE CONTACTO CON VALIDACIÓN =====
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        const nombreInput = document.getElementById('nombre');
        const emailInput = document.getElementById('email');
        const formStatus = document.getElementById('formStatus');

        // Función de validación
        function validateForm() {
            let isValid = true;
            
            // Validar nombre
            if (!nombreInput.value.trim()) {
                showError(nombreInput, 'El nombre es obligatorio');
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
                showError(emailInput, 'Email inválido');
                isValid = false;
            } else {
                clearError(emailInput);
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
        [nombreInput, emailInput].forEach(input => {
            input.addEventListener('input', () => clearError(input));
        });

        // Envío del formulario
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateForm()) {
                formStatus.textContent = 'Por favor corrige los errores';
                formStatus.className = 'form-status error';
                return;
            }

            // Simular envío
            formStatus.textContent = 'Enviando...';
            formStatus.className = 'form-status';
            
            // Simulación de petición (reemplazar con fetch real si hay backend)
            setTimeout(() => {
                formStatus.textContent = '✅ ¡Gracias! Te contactaremos en menos de 24h.';
                formStatus.className = 'form-status success';
                contactForm.reset();
                
                // Limpiar mensaje después de 5 segundos
                setTimeout(() => {
                    formStatus.textContent = '';
                }, 5000);
            }, 1500);
        });
    }

    // ===== ANIMACIONES AL HACER SCROLL (INTERSECTION OBSERVER) =====
    const animatedElements = document.querySelectorAll('.service-card, .step-item, .testimonial-card, .stat-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-up');
                observer.unobserve(entry.target); // Solo una vez
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
            // Si el logo no carga, mostrar texto como fallback
            this.style.display = 'none';
            const fallback = document.createElement('span');
            fallback.className = 'logo-fallback';
            fallback.textContent = 'CuentaConmigo Pro';
            this.parentNode.appendChild(fallback);
        };
    }

    // ===== DETECCIÓN DE SEO/OPENGRAPH (placeholder) =====
    console.log('Sitio CuentaConmigo Pro cargado correctamente');
})();