
(function() {
    'use strict';

    console.log('[NewReviewPlugin] Loading plugin...');

    // CSS for inline ratings UI
    const style = document.createElement('style');
    style.textContent = `
        .user-ratings-container {
            background: rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            padding: 1.8em 2em;
            margin-top: 2em;
            margin-bottom: 2em;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-sizing: border-box;
        }
        .user-ratings-container * {
            box-sizing: border-box;
        }
        .user-ratings-header {
            font-size: 1.3em;
            font-weight: 500;
            margin-bottom: 1.2em;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 1em;
            flex-wrap: wrap;
        }
        .user-ratings-average {
            color: #ffd700;
            font-size: 1.1em;
        }
        .user-ratings-my-rating {
            margin-bottom: 1.5em;
            padding-bottom: 1.5em;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .user-ratings-section-title {
            font-size: 1.15em;
            margin-bottom: 0.3em;
            color: #ffffff;
            font-weight: 600;
        }
        .user-ratings-section-subtitle {
            font-size: 0.9em;
            color: rgba(255, 255, 255, 0.5);
            margin-bottom: 0.8em;
        }
        .rating-form-row {
            display: block;
            margin-top: 0.5em;
        }
        .rating-form-section {
            margin-bottom: 1.6em;
        }
        .star-rating-container {
            display: flex;
            align-items: center;
            gap: 0.8em;
            margin-bottom: 0.5em;
        }
        .star-rating {
            display: inline-flex;
            gap: 0.25em;
            cursor: pointer;
            font-size: 1.9em;
        }
        .star-rating .star {
            color: rgba(255, 255, 255, 0.15);
            transition: color 0.2s, transform 0.15s;
            cursor: pointer;
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
        }
        .star-rating .star.filled {
            color: #ffd700;
        }
        .star-rating .star:hover {
            color: #ffed4e;
            transform: scale(1.15);
        }
        .rating-prompt {
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.9em;
        }
        .rating-note-input {
            width: 100%;
            padding: 1em;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            font-size: 0.95em;
            font-family: inherit;
            transition: border-color 0.2s, background 0.2s;
            resize: vertical;
            min-height: 100px;
            line-height: 1.6;
        }
        .rating-note-input:focus {
            outline: none;
            border-color: #00a4dc;
            background: rgba(0, 0, 0, 0.3);
            box-shadow: 0 0 0 1px #00a4dc;
        }
        .rating-note-input::placeholder {
            color: rgba(255, 255, 255, 0.35);
        }
        .rating-char-count {
            font-size: 0.85em;
            color: rgba(255, 255, 255, 0.4);
            margin-top: 0.5em;
        }
        .rating-char-count.error {
            color: #ff6b6b;
        }
        .rating-actions {
            margin-top: 1.2em;
            display: flex;
            gap: 0.75em;
            flex-wrap: wrap;
        }
        .rating-actions button {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            outline: 0;
            margin: 0;
            cursor: pointer;
            user-select: none;
            vertical-align: middle;
            text-decoration: none;
            font-family: inherit;
            font-weight: 500;
            font-size: 0.9375rem;
            line-height: 1.75;
            letter-spacing: 0.02857em;
            text-transform: uppercase;
            min-width: 64px;
            padding: 8px 22px;
            border-radius: 4px;
            transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
            border: 0;
        }
        .rating-actions .save-btn {
            background-color: #00a4dc;
            color: #fff;
            box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12);
            flex: 1;
            min-width: 200px;
        }
        .rating-actions .save-btn:hover:not(:disabled) {
            background-color: #0091c2;
            box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
        }
        .rating-actions .save-btn:active:not(:disabled) {
            box-shadow: 0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12);
        }
        .rating-actions .save-btn:disabled {
            background-color: rgba(255, 255, 255, 0.12);
            color: rgba(255, 255, 255, 0.3);
            cursor: default;
            pointer-events: none;
            box-shadow: none;
        }
        .rating-actions .delete-btn {
            background-color: transparent;
            color: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.23);
            padding: 7px 21px;
        }
        .rating-actions .delete-btn:hover {
            background-color: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.23);
        }
        .rating-actions .delete-btn:active {
            background-color: rgba(255, 255, 255, 0.12);
        }
        .user-ratings-all {
            margin-top: 1.5em;
        }
        .rating-item {
            margin: 0.75em 0;
            padding: 1em;
            background: rgba(0, 0, 0, 0.12);
            border-radius: 8px;
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .rating-item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5em;
            flex-wrap: wrap;
            gap: 0.5em;
        }
        .rating-item-user {
            font-weight: 500;
            color: #ffffff;
        }
        .rating-item-stars {
            color: #ffd700;
            margin-left: 0.5em;
        }
        .rating-item-date {
            font-size: 0.85em;
            color: rgba(255, 255, 255, 0.5);
        }
        .rating-item-note {
            margin-top: 0.5em;
            opacity: 0.9;
            font-size: 0.95em;
            color: #e0e0e0;
            line-height: 1.4;
        }
    `;
    document.head.appendChild(style);

    let currentItemId = null;
    let currentRating = 0;
    let isInjecting = false;
    let hasTriedRefresh = false;

    function createStarRating(rating, interactive, onHover, onClick) {
        const container = document.createElement('div');
        container.className = 'star-rating';
        let currentSelectedRating = rating;
        
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'star' + (i <= rating ? ' filled' : '');
            star.textContent = '★';
            star.dataset.rating = i;
            
            if (interactive) {
                star.addEventListener('mouseenter', () => onHover(i));
                star.addEventListener('click', () => {
                    currentSelectedRating = i;
                    onClick(i);
                });
            }
            
            container.appendChild(star);
        }
        
        if (interactive) {
            container.addEventListener('mouseleave', () => onHover(currentSelectedRating));
        }
        
        return container;
    }

    function updateStarDisplay(container, rating) {
        const stars = container.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('filled');
            } else {
                star.classList.remove('filled');
            }
        });
    }

    async function loadRatings(itemId) {
        try {
            const response = await fetch(ApiClient.getUrl(`api/NewReviewPlugin/Item/${itemId}`), {
                headers: {
                    'X-Emby-Token': ApiClient.accessToken()
                }
            });
            const data = await response.json();
            console.log('[NewReviewPlugin] Loaded ratings:', data);
            return data;
        } catch (error) {
            console.error('[NewReviewPlugin] Error loading ratings:', error);
            return { ratings: [], averageRating: 0, totalRatings: 0 };
        }
    }

    async function loadMyRating(itemId) {
        try {
            const userId = ApiClient.getCurrentUserId();
            const response = await fetch(ApiClient.getUrl(`api/NewReviewPlugin/MyRating/${itemId}?userId=${userId}`), {
                headers: {
                    'X-Emby-Token': ApiClient.accessToken()
                }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('[NewReviewPlugin] Error loading my rating:', error);
            return null;
        }
    }

    async function saveRating(itemId, rating, note) {
        try {
            const userId = ApiClient.getCurrentUserId();
            const user = await ApiClient.getCurrentUser();
            const userName = user ? user.Name : 'Unknown';
            // Important: api/NewReviewPlugin
            const url = ApiClient.getUrl(`api/NewReviewPlugin/Rate?itemId=${itemId}&userId=${userId}&rating=${rating}${note ? '&note=' + encodeURIComponent(note) : ''}&userName=${encodeURIComponent(userName)}`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-Emby-Token': ApiClient.accessToken()
                }
            });
            
            if (!response.ok) {
                const text = await response.text();
                console.error('[NewReviewPlugin] Server error:', response.status, text);
                return { success: false, message: `Server error: ${response.status}` };
            }
            
            return await response.json();
        } catch (error) {
            console.error('[NewReviewPlugin] Error saving rating:', error);
            return { success: false, message: error.message };
        }
    }

    async function deleteRating(itemId) {
        try {
            const userId = ApiClient.getCurrentUserId();
            const url = ApiClient.getUrl(`api/NewReviewPlugin/Rating?itemId=${itemId}&userId=${userId}`);
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'X-Emby-Token': ApiClient.accessToken()
                }
            });
            return await response.json();
        } catch (error) {
            console.error('[NewReviewPlugin] Error deleting rating:', error);
            return { success: false, message: error.message };
        }
    }

    function seamlessPageRefresh(itemId) {
        // Only refresh on details page
        const currentHash = window.location.hash;
        const currentUrl = window.location.href;
        const isDetailsPage = currentHash.includes('#/details') || currentHash.includes('/details') || 
                              currentUrl.includes('/details') || 
                              (itemId && currentHash.includes(itemId));
        
        if (!isDetailsPage) {
            return;
        }
        
        if (hasTriedRefresh) {
            return;
        }
        
        console.log('[NewReviewPlugin] Performing hard page refresh');
        hasTriedRefresh = true;
        window.location.reload(true);
    }

    async function createRatingsUI(itemId) {
        console.log('[NewReviewPlugin] → createRatingsUI started for:', itemId);
        const container = document.createElement('div');
        container.className = 'user-ratings-container';
        container.id = 'user-ratings-ui';
        
        let itemName = 'este elemento';
        try {
            const itemDetails = await ApiClient.getItem(ApiClient.getCurrentUserId(), itemId);
            if (itemDetails && itemDetails.Name) {
                itemName = itemDetails.Name;
            }
        } catch (error) {
            console.log('[NewReviewPlugin] Could not load item name:', error);
        }
        
        // Header
        const header = document.createElement('div');
        header.className = 'user-ratings-header';
        header.innerHTML = '<span>Reseñas de Usuarios</span>';
        
        const avgSpan = document.createElement('span');
        avgSpan.className = 'user-ratings-average';
        avgSpan.id = 'ratings-average-display';
        header.appendChild(avgSpan);
        container.appendChild(header);
        
        // My Rating Section
        const myRatingSection = document.createElement('div');
        myRatingSection.className = 'user-ratings-my-rating';
        
        // Star Rating Section
        const starSection = document.createElement('div');
        starSection.className = 'rating-form-section';
        
        const myRatingTitle = document.createElement('div');
        myRatingTitle.className = 'user-ratings-section-title';
        myRatingTitle.textContent = `¿Qué te pareció ${itemName}?`;
        starSection.appendChild(myRatingTitle);
        
        const starRatingContainer = document.createElement('div');
        starRatingContainer.className = 'star-rating-container';
        
        const starContainer = createStarRating(0, true,
            (rating) => {
                updateStarDisplay(starContainer, rating);
                ratingPrompt.style.display = rating === 0 ? 'inline' : 'none';
            },
            (rating) => {
                currentRating = rating;
                updateStarDisplay(starContainer, rating);
                ratingPrompt.style.display = 'none';
            }
        );
        starRatingContainer.appendChild(starContainer);
        
        const ratingPrompt = document.createElement('span');
        ratingPrompt.className = 'rating-prompt';
        ratingPrompt.textContent = 'Selecciona tu puntuación';
        starRatingContainer.appendChild(ratingPrompt);
        
        starSection.appendChild(starRatingContainer);
        myRatingSection.appendChild(starSection);
        
        // Review Text Section
        const reviewSection = document.createElement('div');
        reviewSection.className = 'rating-form-section';
        
        const reviewTitle = document.createElement('div');
        reviewTitle.className = 'user-ratings-section-title';
        reviewTitle.textContent = 'Escribe tu reseña';
        reviewSection.appendChild(reviewTitle);
        
        const reviewSubtitle = document.createElement('div');
        reviewSubtitle.className = 'user-ratings-section-subtitle';
        reviewSubtitle.textContent = 'Comparte tu opinión (opcional)';
        reviewSection.appendChild(reviewSubtitle);
        
        const noteInput = document.createElement('textarea');
        noteInput.className = 'rating-note-input';
        noteInput.placeholder = 'Escribe aquí tu reseña...';
        reviewSection.appendChild(noteInput);
        
        const charCount = document.createElement('div');
        charCount.className = 'rating-char-count';
        charCount.textContent = '0 caracteres';
        reviewSection.appendChild(charCount);
        
        noteInput.addEventListener('input', () => {
            const length = noteInput.value.length;
            charCount.textContent = `${length} caracteres`;
        });
        
        myRatingSection.appendChild(reviewSection);
        
        // Actions
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'rating-actions';
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.textContent = 'Publicar Reseña';
        saveBtn.addEventListener('click', async () => {
            if (currentRating === 0) {
                alert('Por favor selecciona una puntuación');
                return;
            }
            
            saveBtn.disabled = true;
            saveBtn.textContent = 'Publicando...';
            
            const result = await saveRating(itemId, currentRating, noteInput.value);
            
            if (result.success) {
                saveBtn.textContent = '¡Publicado!';
                setTimeout(() => {
                    saveBtn.textContent = 'Publicar Reseña';
                    saveBtn.disabled = false;
                }, 2000);
                
                await displayAllRatings(itemId, container);
                deleteBtn.style.display = 'inline-block';
            } else {
                alert('Error al guardar: ' + result.message);
                saveBtn.textContent = 'Publicar Reseña';
                saveBtn.disabled = false;
            }
        });
        actionsContainer.appendChild(saveBtn);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Borrar Reseña';
        deleteBtn.style.display = 'none';
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('¿Borrar tu reseña?')) {
                return;
            }
            
            deleteBtn.disabled = true;
            deleteBtn.textContent = 'Borrando...';
            
            const result = await deleteRating(itemId);
            
            if (result.success) {
                currentRating = 0;
                noteInput.value = '';
                updateStarDisplay(starContainer, 0);
                deleteBtn.style.display = 'none';
                
                await displayAllRatings(itemId, container);
            } else {
                alert('Error al borrar: ' + result.message);
            }
            
            deleteBtn.textContent = 'Borrar Reseña';
            deleteBtn.disabled = false;
        });
        actionsContainer.appendChild(deleteBtn);
        
        myRatingSection.appendChild(actionsContainer);
        container.appendChild(myRatingSection);
        
        // All Ratings Section
        const allRatingsSection = document.createElement('div');
        allRatingsSection.className = 'user-ratings-all';
        allRatingsSection.id = 'all-ratings-section';
        container.appendChild(allRatingsSection);
        
        // Load existing rating
        const myRating = await loadMyRating(itemId);
        if (myRating && myRating.rating) {
            currentRating = myRating.rating;
            updateStarDisplay(starContainer, myRating.rating);
            ratingPrompt.style.display = 'none';
            noteInput.value = myRating.note || '';
            const length = noteInput.value.length;
            charCount.textContent = `${length} caracteres`;
            deleteBtn.style.display = 'inline-block';
        }
        
        // Load all ratings
        await displayAllRatings(itemId, container);
        
        setTimeout(() => {
            const rect = container.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) {
                container.dataset.zeroSize = 'true';
            }
        }, 200);
        
        return container;
    }

    async function displayAllRatings(itemId, container) {
        const allRatingsSection = container.querySelector('#all-ratings-section');
        const avgDisplay = container.querySelector('#ratings-average-display');
        
        if (!allRatingsSection) return;
        
        allRatingsSection.innerHTML = '';
        
        const data = await loadRatings(itemId);
        const ratings = data.ratings || [];
        const averageRating = data.averageRating || 0;
        const totalRatings = data.totalRatings || 0;
        
        if (totalRatings > 0) {
            avgDisplay.textContent = `★ ${averageRating.toFixed(1)} (${totalRatings} ${totalRatings === 1 ? 'reseña' : 'reseñas'})`;
        } else {
            avgDisplay.textContent = 'Sin reseñas aún';
        }
        
        if (ratings.length === 0) {
            return;
        }
        
        const title = document.createElement('div');
        title.className = 'user-ratings-section-title';
        title.textContent = 'Comentarios de la comunidad';
        allRatingsSection.appendChild(title);
        
        ratings.forEach(rating => {
            const item = document.createElement('div');
            item.className = 'rating-item';
            
            const header = document.createElement('div');
            header.className = 'rating-item-header';
            
            const leftSide = document.createElement('div');
            const userName = document.createElement('span');
            userName.className = 'rating-item-user';
            userName.textContent = rating.userName || rating.UserName || 'Usuario';
            leftSide.appendChild(userName);
            
            const stars = document.createElement('span');
            stars.className = 'rating-item-stars';
            const ratingValue = rating.rating || rating.Rating || 0;
            stars.textContent = '★'.repeat(ratingValue) + '☆'.repeat(5 - ratingValue);
            leftSide.appendChild(stars);
            
            header.appendChild(leftSide);
            
            const timestamp = rating.timestamp || rating.Timestamp;
            if (timestamp) {
                const date = document.createElement('span');
                date.className = 'rating-item-date';
                const dateObj = new Date(timestamp);
                date.textContent = dateObj.toLocaleDateString();
                header.appendChild(date);
            }
            
            item.appendChild(header);
            
            const noteText = rating.note || rating.Note;
            if (noteText) {
                const note = document.createElement('div');
                note.className = 'rating-item-note';
                note.textContent = noteText;
                item.appendChild(note);
            }
            
            allRatingsSection.appendChild(item);
        });
    }

    let injectionAttempts = 0;
    const maxInjectionAttempts = 30;
    
    function injectRatingsUI() {
        if (isInjecting) return;
        
        let itemId = null;
        const urlParams = new URLSearchParams(window.location.search);
        itemId = urlParams.get('id');
        
        if (!itemId && window.location.hash.includes('?')) {
            const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
            itemId = hashParams.get('id');
        }
        
        if (!itemId) {
            const guidMatch = window.location.href.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
            if (guidMatch) {
                itemId = guidMatch[1];
            }
        }
        
        if (!itemId) {
            injectionAttempts = 0;
            return;
        }
        
        const existingUI = document.getElementById('user-ratings-ui');
        if (existingUI && currentItemId === itemId) {
            injectionAttempts = 0;
            return;
        }
        
        if (existingUI && currentItemId !== itemId) {
            existingUI.remove();
        }
        
        let targetContainer = null;
        targetContainer = document.querySelector('.detailPagePrimaryContent .detailSection');
        if (!targetContainer) {
            const primaryContent = document.querySelector('.detailPagePrimaryContent');
            if (primaryContent && primaryContent.children.length > 0) {
                targetContainer = primaryContent;
            }
        }
        if (!targetContainer) {
            targetContainer = document.querySelector('.detailSection');
        }
        
        if (!targetContainer) {
            if (injectionAttempts < maxInjectionAttempts) {
                injectionAttempts++;
                const retryDelay = Math.min(100 * Math.pow(1.5, injectionAttempts), 3000);
                setTimeout(injectRatingsUI, retryDelay);
            } else {
                if (!hasTriedRefresh && itemId) {
                    seamlessPageRefresh(itemId);
                } else {
                    injectionAttempts = 0;
                }
            }
            return;
        }
        
        currentItemId = itemId;
        isInjecting = true;
        injectionAttempts = 0;
        
        createRatingsUI(itemId).then(ui => {
            targetContainer.appendChild(ui);
            
            setTimeout(() => {
                const rect = ui.getBoundingClientRect();
                if (rect.width === 0 && rect.height === 0) {
                    const injectedUI = document.getElementById('user-ratings-ui');
                    if (injectedUI) injectedUI.remove();
                    if (!hasTriedRefresh) seamlessPageRefresh(itemId);
                }
            }, 500);
            
            isInjecting = false;
        });
    }
    
    // Observer for navigation changes
    const observer = new MutationObserver((mutations) => {
        injectRatingsUI();
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Initial check
    setTimeout(injectRatingsUI, 1000);
    setInterval(injectRatingsUI, 2000);
    
})();
