let username = localStorage.getItem('globus_user') || "";
let userAvatar = localStorage.getItem('globus_avatar') || "👑";
let selectedAvatarIcon = "👑";

let coins = Number(localStorage.getItem('globus_coins')) || 0;
let clickPower = Number(localStorage.getItem('globus_clickPower')) || 1;
let rebirths = Number(localStorage.getItem('globus_rebirths')) || 0;
let upgradeCost = Number(localStorage.getItem('globus_upgradeCost')) || 10;
let rebirthCost = Number(localStorage.getItem('globus_rebirthCost')) || 1000;
let autoCPS = Number(localStorage.getItem('globus_autoCPS')) || 0;
let autoCost = Number(localStorage.getItem('globus_autoCost')) || 50;

// ЗАГРУЗКА ИНВЕНТАРЯ ИЗ ПАМЯТИ БРАУЗЕРА
let inventory = JSON.parse(localStorage.getItem('globus_inventory')) || {};

// DOM Элементы
const modal = document.getElementById('register-modal');
const usernameInput = document.getElementById('username-input');
const saveProfileBtn = document.getElementById('save-profile-btn');
const userAvatarDisplay = document.getElementById('user-avatar');
const userNameDisplay = document.getElementById('user-name');
const rankBadge = document.querySelector('.rank-badge');

const coinsDisplay = document.getElementById('coins');
const clickPowerDisplay = document.getElementById('click-power');
const rebirthsDisplay = document.getElementById('rebirths');
const upgradeCostDisplay = document.getElementById('upgrade-cost');
const rebirthCostDisplay = document.getElementById('rebirth-cost');
const clickBtn = document.getElementById('click-btn');
const buyUpgradeBtn = document.getElementById('buy-upgrade-btn');
const buyRebirthBtn = document.getElementById('buy-rebirth-btn');
const inventoryGrid = document.getElementById('inventory-grid');
const emptyText = document.getElementById('empty-inventory-text');

// Добавляем авто-кликер на лету
const shopSection = document.querySelector('.shop');
const autoShopItem = document.createElement('div');
autoShopItem.className = 'shop-item';
autoShopItem.innerHTML = `
    <span>⚙️ Авто-кликер (+1/с) (Цена: <span id="auto-cost">${autoCost}</span> 🪙)</span>
    <button id="buy-auto-btn">Купить</button>
`;
shopSection.insertBefore(autoShopItem, shopSection.children[2]);
const buyAutoBtn = document.getElementById('buy-auto-btn');
const autoCostDisplay = document.getElementById('auto-cost');

if (!username) {
    modal.style.display = "flex";
} else {
    loadProfileUI();
}

window.selectAvatar = function(avatar) {
    selectedAvatarIcon = avatar;
    const opts = document.querySelectorAll('.avatar-opt');
    opts.forEach(opt => opt.classList.remove('active'));
    event.target.classList.add('active');
}

saveProfileBtn.addEventListener('click', () => {
    let enteredName = usernameInput.value.trim();
    if (enteredName === "") {
        enteredName = "Модератор-" + Math.floor(Math.random() * 900 + 100);
    }
    username = enteredName;
    userAvatar = selectedAvatarIcon;
    
    localStorage.setItem('globus_user', username);
    localStorage.setItem('globus_avatar', userAvatar);
    
    modal.style.display = "none";
    loadProfileUI();
});

function loadProfileUI() {
    userNameDisplay.innerText = username;
    userAvatarDisplay.innerText = userAvatar;
    updateRank();
    renderInventory();
}

function updateRank() {
    if (rebirths >= 10) {
        rankBadge.innerText = "ГЛАВНЫЙ АДМИН 👑";
        rankBadge.style.backgroundColor = "#ef4444";
    } else if (rebirths >= 5) {
        rankBadge.innerText = "Ст. Модератор ⚡";
        rankBadge.style.backgroundColor = "#ec4899";
    } else if (rebirths >= 2) {
        rankBadge.innerText = "Модератор 🎮";
        rankBadge.style.backgroundColor = "#a855f7";
    } else {
        rankBadge.innerText = "Мл. Модератор 🌱";
        rankBadge.style.backgroundColor = "#38bdf8";
    }
}

// КЛИКИ И АПГРЕЙДЫ
clickBtn.addEventListener('click', () => {
    let totalClick = clickPower + (rebirths * 2);
    coins += totalClick;
    updateUI();
});

buyUpgradeBtn.addEventListener('click', () => {
    if (coins >= upgradeCost) {
        coins -= upgradeCost;
        clickPower += 1;
        upgradeCost = Math.round(upgradeCost * 1.5);
        updateUI();
        saveGame();
    }
});

buyAutoBtn.addEventListener('click', () => {
    if (coins >= autoCost) {
        coins -= autoCost;
        autoCPS += 1;
        autoCost = Math.round(autoCost * 1.6);
        updateUI();
        saveGame();
    }
});

buyRebirthBtn.addEventListener('click', () => {
    if (coins >= rebirthCost) {
        rebirths += 1;
        coins = 0;
        clickPower = 1;
        autoCPS = 0;
        upgradeCost = 10;
        autoCost = 50;
        rebirthCost = Math.round(rebirthCost * 2.5);
        updateRank();
        updateUI();
        saveGame();
    }
});

// ФУНКЦИЯ ПОКУПКИ ПОДАРКА ИЗ СКРИНШОТА
window.buyGift = function(giftId, price, emoji) {
    if (coins >= price) {
        coins -= price;
        
        // Добавляем в инвентарь
        if (inventory[giftId]) {
            inventory[giftId].count += 1;
        } else {
            inventory[giftId] = { emoji: emoji, count: 1 };
        }
        
        updateUI();
        renderInventory();
        saveGame();
    } else {
        alert("Не хватает монет 🪙 для покупки этого подарка!");
    }
}

// ОТРИСОВКА ИНВЕНТАРЯ КАК В RUMS
function renderInventory() {
    // Очищаем старые элементы, кроме текста о пустом инвентаре
    const items = inventoryGrid.querySelectorAll('.inventory-item');
    items.forEach(item => item.remove());
    
    let hasItems = false;
    
    for (let id in inventory) {
        if (inventory[id].count > 0) {
            hasItems = true;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            itemDiv.innerHTML = `
                <div class="item-counter">${inventory[id].count}</div>
                ${inventory[id].emoji}
            `;
            inventoryGrid.appendChild(itemDiv);
        }
    }
    
    if (hasItems) {
        emptyText.style.display = 'none';
    } else {
        emptyText.style.display = 'block';
    }
}

setInterval(() => {
    if (autoCPS > 0) {
        coins += autoCPS;
        updateUI();
    }
}, 1000);

setInterval(saveGame, 5000);

function saveGame() {
    localStorage.setItem('globus_coins', coins);
    localStorage.setItem('globus_clickPower', clickPower);
    localStorage.setItem('globus_rebirths', rebirths);
    localStorage.setItem('globus_upgradeCost', upgradeCost);
    localStorage.setItem('globus_rebirthCost', rebirthCost);
    localStorage.setItem('globus_autoCPS', autoCPS);
    localStorage.setItem('globus_autoCost', autoCost);
    localStorage.setItem('globus_inventory', JSON.stringify(inventory));
}

function updateUI() {
    coinsDisplay.innerText = coins;
    clickPowerDisplay.innerText = clickPower + (rebirths * 2);
    rebirthsDisplay.innerText = rebirths;
    upgradeCostDisplay.innerText = upgradeCost;
    rebirthCostDisplay.innerText = rebirthCost;
    autoCostDisplay.innerText = autoCost;
    
    buyUpgradeBtn.disabled = coins < upgradeCost;
    buyAutoBtn.disabled = coins < autoCost;
    buyRebirthBtn.disabled = coins < rebirthCost;
}

updateUI();
