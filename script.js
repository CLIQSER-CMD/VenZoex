// VenZoex Product Catalog - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const filterChips = document.querySelectorAll('.chip');
    const productCards = document.querySelectorAll('.product-card');
    const dmButtons = document.querySelectorAll('.dm-btn');
    const detailsButtons = document.querySelectorAll('.details-btn');
    const modal = document.getElementById('productModal');
    const modalClose = document.getElementById('modalClose');
    const modalDmBtn = document.getElementById('modalDmBtn');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    // Instagram DM URL
    const INSTAGRAM_DM_URL = 'https://www.instagram.com/khmart.in?igsh=MTB2dWFrYzVwcDByNw==';

    // Mobile Menu Toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Search Functionality
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let hasResults = false;

        productCards.forEach(card => {
            const productName = card.getAttribute('data-name').toLowerCase();
            const productCategory = card.getAttribute('data-category').toLowerCase();

            if (productName.includes(searchTerm) || productCategory.includes(searchTerm)) {
                card.classList.remove('hidden');
                hasResults = true;
            } else {
                card.classList.add('hidden');
            }
        });

        // Show/hide category sections based on visible products
        updateCategoryVisibility();

        // Show no results message if needed
        showNoResultsMessage(hasResults);
    }

    // Search input event listeners
    searchInput.addEventListener('input', performSearch);
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Category Filter Functionality
    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            // Remove active class from all chips
            filterChips.forEach(c => c.classList.remove('active'));
            // Add active class to clicked chip
            this.classList.add('active');

            const category = this.getAttribute('data-category');

            productCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });

            // Update category visibility
            updateCategoryVisibility();

            // Scroll to catalog section
            if (category !== 'all') {
                const sectionId = category === 'body-jewellery' ? 'body-jewellery' : category;
                const section = document.getElementById(sectionId);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // Update category section visibility
    function updateCategoryVisibility() {
        const categories = ['electronics', 'beauty', 'dresses', 'accessories', 'body-jewellery'];
        
        categories.forEach(category => {
            const section = document.getElementById(category);
            if (section) {
                const grid = section.querySelector('.products-grid');
                const visibleCards = grid.querySelectorAll('.product-card:not(.hidden)');
                
                if (visibleCards.length === 0) {
                    section.style.display = 'none';
                } else {
                    section.style.display = 'block';
                }
            }
        });
    }

    // Show no results message
    function showNoResultsMessage(hasResults) {
        // Remove existing no results message
        const existingMessage = document.querySelector('.no-results');
        if (existingMessage) {
            existingMessage.remove();
        }

        if (!hasResults) {
            const catalog = document.querySelector('.catalog .container');
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results';
            noResultsDiv.innerHTML = `
                <div class="no-results-icon">🔍</div>
                <p>No products found matching your search.</p>
            `;
            catalog.appendChild(noResultsDiv);
        }
    }

    // DM Button Functionality
    function handleDMClick(productName, price) {
        const message = `Hi, I want to order: ${productName} (${price}) from VenZoex`;
        
        // Copy message to clipboard
        copyToClipboard(message);
        
        // Show toast notification
        showToast('Message copied! Opening Instagram...');
        
        // Open Instagram DM after a short delay
        setTimeout(() => {
            window.open(INSTAGRAM_DM_URL, '_blank');
        }, 1000);
    }

    // Add click event to DM buttons
    dmButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-product');
            const price = this.getAttribute('data-price');
            handleDMClick(productName, price);
        });
    });

    // Modal DM button
    modalDmBtn.addEventListener('click', function() {
        const productName = document.getElementById('modalTitle').textContent;
        const price = document.getElementById('modalPrice').textContent;
        handleDMClick(productName, price);
        closeModal();
    });

    // Details Button Functionality
    detailsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-product');
            const description = this.getAttribute('data-description');
            const price = this.getAttribute('data-price');
            const category = this.getAttribute('data-category');

            // Populate modal
            document.getElementById('modalTitle').textContent = productName;
            document.getElementById('modalDescription').textContent = description;
            document.getElementById('modalPrice').textContent = price;
            document.getElementById('modalCategory').textContent = category;

            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close Modal Functions
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Copy to Clipboard Function
    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            // Navigator clipboard API method
            navigator.clipboard.writeText(text).then(function() {
                console.log('Text copied to clipboard');
            }).catch(function(err) {
                console.error('Could not copy text: ', err);
                fallbackCopyToClipboard(text);
            });
        } else {
            // Fallback method
            fallbackCopyToClipboard(text);
        }
    }

    // Fallback copy method
    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            console.log('Fallback: Copying text command was ' + (successful ? 'successful' : 'unsuccessful'));
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
    }

    // Show Toast Notification
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('active');

        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }

    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 2px 20px rgba(74, 55, 40, 0.15)';
        } else {
            navbar.style.boxShadow = '0 2px 10px var(--shadow)';
        }

        lastScroll = currentScroll;
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Initialize - ensure all products are visible
    productCards.forEach(card => {
        card.classList.remove('hidden');
    });

    console.log('VenZoex Product Catalog loaded successfully!');
});