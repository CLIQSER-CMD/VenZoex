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
    
    // New Feature Elements
    const themeToggle = document.getElementById('themeToggle');
    const sortSelect = document.getElementById('sortSelect');
    const faqQuestions = document.querySelectorAll('.faq-question');
    const backToTop = document.getElementById('backToTop');

    // Instagram DM URL
    const INSTAGRAM_DM_URL = 'https://www.instagram.com/venzoex.online/';

    // Theme logic
    const currentTheme = localStorage.getItem('venzoex_theme') || 'light';
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if(themeToggle) themeToggle.innerHTML = '<span class="icon-sun">☀️</span>';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('venzoex_theme', 'light');
                themeToggle.innerHTML = '<span class="icon-moon">🌙</span>';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('venzoex_theme', 'dark');
                themeToggle.innerHTML = '<span class="icon-sun">☀️</span>';
            }
        });
    }

    // Mobile Menu Toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Helper: Parse Price
    function parsePrice(priceStr) {
        if (!priceStr) return 0;
        const parsed = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
        return isNaN(parsed) ? 0 : parsed;
    }

    // Sort Products Function
    function sortProducts() {
        if (!sortSelect) return;
        const sortValue = sortSelect.value;
        const grids = document.querySelectorAll('.products-grid');
        
        grids.forEach(grid => {
            const cards = Array.from(grid.querySelectorAll('.product-card'));
            
            cards.forEach((card, index) => {
                if (sortValue === 'recommended') {
                    card.style.order = 0; // Natural DOM order
                } else {
                    const priceBtn = card.querySelector('.dm-btn');
                    const priceStr = priceBtn ? priceBtn.getAttribute('data-price') : '0';
                    const priceVal = parsePrice(priceStr);
                    
                    if (sortValue === 'price-low') {
                        card.style.order = Math.round(priceVal);
                    } else if (sortValue === 'price-high') {
                        card.style.order = -Math.round(priceVal);
                    }
                }
            });
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', sortProducts);
    }

    // Unified Filtering Function
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const activeChip = document.querySelector('.chip.active');
        const activeCategory = activeChip ? activeChip.getAttribute('data-category') : 'all';
        
        let hasResults = false;

        productCards.forEach(card => {
            const productName = card.getAttribute('data-name').toLowerCase();
            const productCategory = card.getAttribute('data-category').toLowerCase();
            
            const matchesSearch = productName.includes(searchTerm) || productCategory.includes(searchTerm);
            const matchesCategory = activeCategory === 'all' || productCategory === activeCategory;

            if (matchesSearch && matchesCategory) {
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

    // Header Navigation Links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get category from href (e.g., #electronics -> electronics)
            const targetId = this.getAttribute('href').substring(1);
            
            // If targetId is a category, update chips and filter
            const correspondingChip = document.querySelector(`.chip[data-category="${targetId}"]`);
            
            if (correspondingChip || targetId === 'home') {
                // Update active chip
                filterChips.forEach(c => c.classList.remove('active'));
                if (correspondingChip) {
                    correspondingChip.classList.add('active');
                } else {
                    document.querySelector('.chip[data-category="all"]').classList.add('active');
                }
                
                // Apply filters
                applyFilters();

                // Close mobile menu
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');

                // Scroll to section
                if (targetId === 'home') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    const section = document.getElementById(targetId);
                    if (section) {
                        const offsetTop = section.offsetTop - 80;
                        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                    }
                }
            }
        });
    });

    // Search input event listeners
    searchInput.addEventListener('input', applyFilters);
    searchBtn.addEventListener('click', applyFilters);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });

    // Category Filter Chip Functionality
    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            // Update active state
            filterChips.forEach(c => c.classList.remove('active'));
            this.classList.add('active');

            // Apply unified filters
            applyFilters();

            // Scroll to catalog section if not "All"
            const category = this.getAttribute('data-category');
            if (category !== 'all') {
                const section = document.getElementById(category);
                if (section && section.style.display !== 'none') {
                    const offsetTop = section.offsetTop - 80;
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                }
            }
        });
    });

    // Update category section visibility
    function updateCategoryVisibility() {
        const categories = ['earrings', 'bracelets', 'pendants'];
        
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
        const existingMessage = document.querySelector('.no-results');
        if (existingMessage) existingMessage.remove();

        if (!hasResults) {
            const catalog = document.querySelector('.catalog .container');
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results';
            noResultsDiv.innerHTML = `
                <div class="no-results-icon">🔍</div>
                <p>No products found matching your search in this category.</p>
                <button class="btn btn-secondary reset-filters" id="resetFilters">Clear all filters</button>
            `;
            catalog.appendChild(noResultsDiv);

            // Add reset functionality
            document.getElementById('resetFilters').addEventListener('click', () => {
                searchInput.value = '';
                filterChips.forEach(c => c.classList.remove('active'));
                document.querySelector('.chip[data-category="all"]').classList.add('active');
                applyFilters();
            });
        }
    }

    // DM Button Functionality
    function handleDMClick(productName, price) {
        // Splitting "Code – Name" for better formatting
        const parts = productName.split(' – ');
        const code = parts[0] || 'N/A';
        const name = parts[1] || productName;

        const message = `Hi VenZoex! I'd like to order:
Product: ${name}
Code: ${code}
Price: ${price}`;

        copyToClipboard(message);
        showToast('Message copied! Opening Instagram...');
        setTimeout(() => {
            window.open(INSTAGRAM_DM_URL, '_blank');
        }, 1000);
    }

    dmButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-product');
            const price = this.getAttribute('data-price');
            handleDMClick(productName, price);
        });
    });

    modalDmBtn.addEventListener('click', function() {
        const productName = document.getElementById('modalTitle').textContent;
        const price = document.getElementById('modalPrice').textContent;
        handleDMClick(productName, price);
        closeModal();
    });

    // Details Button Functionality (Modal)
    detailsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.product-card');
            const productName = this.getAttribute('data-product');
            const description = this.getAttribute('data-description');
            const price = this.getAttribute('data-price');
            const category = this.getAttribute('data-category');
            const modalImageContainer = document.getElementById('modalImageContainer');
            
            // Get image or placeholder from card
            const imgElement = card.querySelector('img');
            const placeholder = card.querySelector('.image-placeholder');
            
            modalImageContainer.innerHTML = ''; // Clear previous content

            if (imgElement) {
                const newImg = imgElement.cloneNode(true);
                newImg.style.width = '100%';
                newImg.style.height = '300px';
                newImg.style.objectFit = 'cover';
                newImg.style.borderRadius = '10px';
                modalImageContainer.appendChild(newImg);
            } else if (placeholder) {
                const newPlaceholder = placeholder.cloneNode(true);
                newPlaceholder.classList.add('large');
                modalImageContainer.appendChild(newPlaceholder);
            } else {
                // Fallback placeholder
                modalImageContainer.innerHTML = `
                    <div class="image-placeholder large">
                        <span class="placeholder-icon">📦</span>
                        <span class="placeholder-text">Product Image</span>
                    </div>
                `;
            }

            // Populate modal text
            document.getElementById('modalTitle').textContent = productName;
            document.getElementById('modalDescription').textContent = description;
            document.getElementById('modalPrice').textContent = price;
            document.getElementById('modalCategory').textContent = category;

            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });

    // Utility: Copy to Clipboard
    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).catch(() => fallbackCopyToClipboard(text));
        } else {
            fallbackCopyToClipboard(text);
        }
    }

    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try { document.execCommand('copy'); } catch (err) { console.error('Copy failed', err); }
        document.body.removeChild(textArea);
    }

    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('active');
        setTimeout(() => toast.classList.remove('active'), 3000);
    }

    // Navbar scroll effect and Back to Top
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (window.pageYOffset > 100) {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.boxShadow = '0 2px 10px var(--shadow)';
        }
        
        if (backToTop) {
            if (window.pageYOffset > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // FAQ Accordion Logic
    if (faqQuestions) {
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const isActive = question.classList.contains('active');
                
                // Close all other FAQs
                faqQuestions.forEach(q => {
                    q.classList.remove('active');
                    q.nextElementSibling.style.maxHeight = null;
                });

                if (!isActive) {
                    question.classList.add('active');
                    const answer = question.nextElementSibling;
                    answer.style.maxHeight = answer.scrollHeight + "px";
                }
            });
        });
    }

    // --- The Vault (Wishlist) Logic ---
    const vaultFab = document.getElementById('vaultFab');
    const vaultCount = document.getElementById('vaultCount');
    let vaultItems = JSON.parse(localStorage.getItem('venzoex_vault')) || [];

    // Inject Heart Buttons into all product cards dynamically
    productCards.forEach(card => {
        const imageContainer = card.querySelector('.product-image');
        const productNameRaw = card.getAttribute('data-name');
        
        // Extract full product info from the primary DM button in this card
        const dmBtn = card.querySelector('.dm-btn');
        const fullProductName = dmBtn ? dmBtn.getAttribute('data-product') : productNameRaw;
        const price = dmBtn ? dmBtn.getAttribute('data-price') : 'TBD';

        const heartBtn = document.createElement('button');
        heartBtn.className = 'wishlist-btn tooltip-container';
        heartBtn.innerHTML = '🤍<span class="tooltip-text">Add to Vault</span>';
        
        // Check if already in vault
        if (vaultItems.some(item => item.product === fullProductName)) {
            heartBtn.innerHTML = '❤️<span class="tooltip-text">Remove from Vault</span>';
            heartBtn.classList.add('active');
        }

        heartBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent defaults
            
            const existingIndex = vaultItems.findIndex(item => item.product === fullProductName);
            
            if (existingIndex > -1) {
                // Remove
                vaultItems.splice(existingIndex, 1);
                heartBtn.innerHTML = '🤍<span class="tooltip-text">Add to Vault</span>';
                heartBtn.classList.remove('active');
                showToast('Removed from Vault');
            } else {
                // Add
                vaultItems.push({ product: fullProductName, price: price });
                heartBtn.innerHTML = '❤️<span class="tooltip-text">Remove from Vault</span>';
                heartBtn.classList.add('active');
                
                // Pop animation
                heartBtn.style.transform = 'scale(1.3)';
                setTimeout(() => heartBtn.style.transform = '', 200);
                showToast('Added to Vault ✨');
            }
            
            saveVault();
        });

        if(imageContainer) {
            imageContainer.appendChild(heartBtn);
        }
    });

    function saveVault() {
        localStorage.setItem('venzoex_vault', JSON.stringify(vaultItems));
        updateVaultUI();
    }

    function updateVaultUI() {
        if(vaultCount) vaultCount.textContent = vaultItems.length;
        if(vaultFab) {
            if (vaultItems.length > 0) {
                vaultFab.classList.add('visible');
            } else {
                vaultFab.classList.remove('visible');
            }
        }
    }

    // Initial UI update
    updateVaultUI();

    // Vault FAB Click - Generate Bulk Order DM
    if(vaultFab) {
        vaultFab.addEventListener('click', () => {
            if (vaultItems.length === 0) return;

            let message = `Hi VenZoex! I'd like to order from my Vault:\n\n`;
            let totalEstimated = 0;

            vaultItems.forEach((item, index) => {
                message += `${index + 1}. ${item.product} (${item.price})\n`;
                // Attempt to parse price to add a total count safely handling decimals
                const priceVal = parseFloat(item.price.replace(/[^0-9.]/g, ''));
                if (!isNaN(priceVal)) {
                    totalEstimated += priceVal;
                }
            });

            if (totalEstimated > 0) {
                message += `\nEstimated Total: ₹${totalEstimated}`;
            }
            
            message += `\n\nPlease let me know the payment details!`;

            copyToClipboard(message);
            showToast('Vault order copied! Opening Instagram...');
            setTimeout(() => {
                window.open(INSTAGRAM_DM_URL, '_blank');
            }, 1000);
        });
    }

    console.log('VenZoex Product Catalog enhanced successfully!');
});