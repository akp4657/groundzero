//
// Scripts
//

window.addEventListener('DOMContentLoaded', () => {
    const navbarCollapsible = document.body.querySelector('#mainNav');
    const navbarShrink = () => {
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink');
        } else {
            navbarCollapsible.classList.add('navbar-shrink');
        }
    };

    navbarShrink();
    document.addEventListener('scroll', navbarShrink);

    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(document.querySelectorAll('#navbarResponsive .nav-link'));
    responsiveNavItems.forEach((responsiveNavItem) => {
        responsiveNavItem.addEventListener('click', () => {
            if (navbarToggler && window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    const gzEventsCardsRow = document.getElementById('gz-events-cards');
    if (gzEventsCardsRow) {
        const syncGzEventMediaStrips = () => {
            const strips = Array.from(gzEventsCardsRow.querySelectorAll('.gz-event-card__media'));
            if (strips.length < 2) {
                return;
            }

            strips.forEach((strip) => {
                strip.style.height = '';
            });

            const maxH = Math.max(
                ...strips.map((strip) => strip.getBoundingClientRect().height),
                0
            );

            if (maxH > 0) {
                strips.forEach((strip) => {
                    strip.style.height = `${Math.ceil(maxH)}px`;
                });
            }
        };

        window.addEventListener('load', syncGzEventMediaStrips);
        requestAnimationFrame(() => {
            requestAnimationFrame(syncGzEventMediaStrips);
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(syncGzEventMediaStrips, 80);
        });
    }

    const initSeminarGuestModal = () => {
        const root = document.getElementById('seminars-at-ground-zero');
        const dataEl = document.getElementById('gz-seminar-guests-data');
        const modalEl = document.getElementById('gzSeminarModal');
        const titleEl = document.getElementById('gzSeminarModalLabel');
        const carouselEl = document.getElementById('gzSeminarCarousel');
        if (!root || !dataEl || !modalEl || !titleEl || !carouselEl || !window.bootstrap) {
            return;
        }

        const innerEl = carouselEl.querySelector('.carousel-inner');
        const prevBtn = carouselEl.querySelector('.carousel-control-prev');
        const nextBtn = carouselEl.querySelector('.carousel-control-next');
        if (!innerEl || !prevBtn || !nextBtn) {
            return;
        }

        let guests = [];
        try {
            guests = JSON.parse(dataEl.textContent || '[]');
        } catch {
            return;
        }
        if (!Array.isArray(guests) || guests.length === 0) {
            return;
        }

        const slidesForGuest = (guest) => {
            if (Array.isArray(guest.slides) && guest.slides.length > 0) {
                return guest.slides.map((s) => ({
                    image: s.image || guest.image || 'assets/img/roster/placeholder.svg',
                    caption: s.caption != null ? String(s.caption) : ''
                }));
            }
            const parts = [];
            if (guest.name) parts.push(String(guest.name));
            if (guest.date) parts.push(String(guest.date));
            if (guest.note) parts.push(String(guest.note));
            const caption = parts.join(' — ');
            return [
                {
                    image: guest.image || 'assets/img/roster/placeholder.svg',
                    caption: caption || String(guest.name || '')
                }
            ];
        };

        const buildCarousel = (guest) => {
            const existing = window.bootstrap.Carousel.getInstance(carouselEl);
            if (existing) {
                existing.dispose();
            }
            carouselEl.querySelectorAll('.carousel-indicators').forEach((el) => el.remove());
            innerEl.replaceChildren();

            const slides = slidesForGuest(guest);
            carouselEl.classList.toggle('gz-seminar-carousel--multi', slides.length > 1);

            if (slides.length > 1) {
                const indicators = document.createElement('div');
                indicators.className = 'carousel-indicators';
                slides.forEach((_, i) => {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.dataset.bsTarget = '#gzSeminarCarousel';
                    b.dataset.bsSlideTo = String(i);
                    b.setAttribute('aria-label', `Image ${i + 1} of ${slides.length}`);
                    if (i === 0) {
                        b.classList.add('active');
                        b.setAttribute('aria-current', 'true');
                    }
                    indicators.appendChild(b);
                });
                carouselEl.insertBefore(indicators, innerEl);
            }

            slides.forEach((slide, i) => {
                const item = document.createElement('div');
                item.className = `carousel-item${i === 0 ? ' active' : ''}`;

                const img = document.createElement('img');
                img.src = slide.image;
                img.alt = slide.caption ? slide.caption.slice(0, 120) : '';
                img.className = 'd-block w-100';
                img.decoding = 'async';

                const cap = document.createElement('div');
                cap.className = 'carousel-caption';
                const p = document.createElement('p');
                p.textContent = slide.caption || '';
                cap.appendChild(p);

                item.appendChild(img);
                item.appendChild(cap);
                innerEl.appendChild(item);
            });

            const multi = slides.length > 1;
            prevBtn.classList.toggle('d-none', !multi);
            nextBtn.classList.toggle('d-none', !multi);

            window.bootstrap.Carousel.getOrCreateInstance(carouselEl, {
                interval: false,
                wrap: true,
                keyboard: true,
                touch: true
            });
        };

        const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);

        modalEl.addEventListener('hidden.bs.modal', () => {
            const inst = window.bootstrap.Carousel.getInstance(carouselEl);
            if (inst) {
                inst.dispose();
            }
        });

        root.addEventListener('click', (e) => {
            const trigger = e.target.closest('.gz-seminar-card-trigger');
            if (!trigger) {
                return;
            }
            const idx = Number.parseInt(trigger.getAttribute('data-seminar-index'), 10);
            if (Number.isNaN(idx) || !guests[idx]) {
                return;
            }
            const guest = guests[idx];
            titleEl.textContent = guest.name || 'Seminar';
            buildCarousel(guest);
            modal.show();
        });
    };

    initSeminarGuestModal();
});
