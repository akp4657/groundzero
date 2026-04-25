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
});
