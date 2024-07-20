// Configuration and initialization
let root, config, cfg;


if (location.href.startsWith("http://localhost")) {
    root = document;

    const scriptKey = Object.keys(win.scriptsdata)[0];
    config = win.scriptsdata[scriptKey].config;

    cfg = (k, v) => {
        if (v !== undefined) console.log(`${k}: Set to ${v}`);

        return win.scriptsdata[scriptKey].cfg(k, v);
    };
} else {
    root = _root;
    config = _config;
    cfg = _cfg;

}
const { props, category } = config;

// UI elements
const elements = {
    mainContainer: root.querySelector('.main-container'),
    floatingBall: root.querySelector('.floating-ball'),
    panel: root.querySelector('.panel'),
    panelMain: root.querySelector('.panel-main'),
    toolbar: root.querySelector('.toolbar'),
    closeBtn: root.querySelector('.closeBtn'),

    categoryContainer: root.querySelector('.category-container'),
    contentContainer: root.querySelector('.content-container'),
};
let contentDivs = new Map();

// Helper functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const toggleElementDisplay = (element, display) => element ? element.style.display = display : null;

// Panel animation functions
let panelIsOpening = false;
async function animatePanel(isOpening) {
    const { floatingBall, ballToPanel, panel, panelMain } = elements;

    panelIsOpening = isOpening;
    if (isOpening) {
        panel.classList.remove('hidden');
    } else {
        panel.classList.add('hidden');
    }
}

// Event listeners
elements.floatingBall.onclick = () => animatePanel(!panelIsOpening);
elements.closeBtn.onclick = () => animatePanel(false);

//dragElement
let isDragging = false;
let startX, startY;
let initialLeft, initialTop;

// 鼠标按下时的处理函数
elements.toolbar.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialLeft = elements.mainContainer.offsetLeft;
    initialTop = elements.mainContainer.offsetTop;

    // 防止文本选中
    e.preventDefault();
});

// 鼠标移动时的处理函数
root.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    elements.mainContainer.style.left = `${initialLeft + dx}px`;
    elements.mainContainer.style.top = `${initialTop + dy}px`;
});

// 鼠标释放时的处理函数
elements.toolbar.addEventListener('mouseup', () => {
    isDragging = false;
});



// Generate category tabs
function generateCategoryTabs() {
    let current = null

    for (const item of category) {
        const categoryItem = document.createElement('li');
        categoryItem.className = 'cursor-pointer inline-flex items-center px-4 py-3 text-white bg-blue-700 rounded-lg active w-full dark:bg-blue-600';
        categoryItem.id = `category-${item.key}-tab`;
        categoryItem.innerHTML = `<svg class="w-4 h-4 me-2 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
        </svg>  <span>${item.display}</span>`

        const contentItem = document.createElement('div');
        contentItem.className = `content-container-item hidden`;
        contentItem.id = `content-${item.key}-container`;
        contentDivs.set(item.key, contentItem);

        categoryItem.onclick = () => {
            toggleElementDisplay(current, 'none');
            toggleElementDisplay(contentDivs.get(item.key), 'block');
            current = contentDivs.get(item.key);
        }

        elements.contentContainer.append(contentItem);
        elements.categoryContainer.append(categoryItem);
    }

}

// Create tooltip element
function createTooltip(text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip opacity-0 invisible absolute bg-gray-800 text-white text-xs rounded py-2 px-3 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 z-10 whitespace-nowrap';
    tooltip.style.bottom = 'calc(100% + 10px)';
    tooltip.textContent = text;

    // Add arrow
    const arrow = document.createElement('div');
    arrow.className = 'absolute left-1/2 transform -translate-x-1/2 -bottom-1';
    arrow.style.borderLeft = '6px solid transparent';
    arrow.style.borderRight = '6px solid transparent';
    arrow.style.borderTop = '6px solid #1f2937'; // Match bg-gray-800
    tooltip.appendChild(arrow);

    return tooltip;
}
// Create description element
function createDescription(text) {
    const description = document.createElement('p');
    description.className = 'text-sm text-gray-600 mt-2 leading-relaxed';
    description.textContent = text;
    return description;
}

// Create base element
function createBaseElement(content, cfg, key, item, inputElement) {
    const { display, description, tooltip } = item;
    const outerDiv = document.createElement('div');
    outerDiv.className = 'bg-white p-4 rounded-lg shadow-md relative mb-6';

    const labelContainer = document.createElement('div');
    labelContainer.className = 'flex items-center justify-between mb-2';

    const label = document.createElement('label');
    label.className = 'text-sm font-medium text-gray-700 flex items-center';

    const span = document.createElement('span');
    span.textContent = display;

    label.appendChild(span);

    if (tooltip) {
        const infoIcon = document.createElement('span');
        infoIcon.className = 'ml-2 text-gray-400 hover:text-gray-600 cursor-help';
        infoIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

        const tooltipElement = createTooltip(tooltip);
        infoIcon.appendChild(tooltipElement);

        infoIcon.onmouseenter = () => {
            tooltipElement.classList.remove('opacity-0', 'invisible');
            tooltipElement.classList.add('opacity-100', 'visible');
        };
        infoIcon.onmouseleave = () => {
            tooltipElement.classList.add('opacity-0', 'invisible');
            tooltipElement.classList.remove('opacity-100', 'visible');
        };

        label.appendChild(infoIcon);
    }

    labelContainer.appendChild(label);
    labelContainer.appendChild(inputElement);
    outerDiv.appendChild(labelContainer);

    if (description) {
        outerDiv.appendChild(createDescription(description));
    }

    content.appendChild(outerDiv);
}

// Setting widget creators
let settingWidgetCreators = {
    note: (content, cfg, key, item) => {
        const note = document.createElement('div');
        note.className = 'bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg shadow-md mb-6';

        const noteContent = document.createElement('div');
        noteContent.className = 'flex items-start';


        const textContainer = document.createElement('div');
        const text = document.createElement('p');
        text.className = 'font-medium';
        text.textContent = item.display || '';
        textContainer.appendChild(text);

        if (item.description) {
            const description = document.createElement('p');
            description.className = 'text-sm mt-1';
            description.textContent = item.description;
            textContainer.appendChild(description);
        }

        noteContent.appendChild(textContainer);
        note.appendChild(noteContent);

        content.appendChild(note);
    },

    bool: (content, cfg, key, item) => {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'w-5 h-5 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500';
        input.checked = cfg(key);
        input.onchange = (e) => cfg(key, e.target.checked);
        createBaseElement(content, cfg, key, item, input);
    },

    option: (content, cfg, key, item) => {
        const select = document.createElement('select');
        select.className = 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5';
        select.innerHTML = item.options.map(option =>
            `<option value="${option.key}">${option.display}</option>`
        ).join('');
        select.value = cfg(key);
        select.onchange = (e) => cfg(key, e.target.value);
        createBaseElement(content, cfg, key, item, select);
    },

    text: (content, cfg, key, item) => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5';
        input.value = cfg(key);
        input.onchange = (e) => cfg(key, e.target.value);
        createBaseElement(content, cfg, key, item, input);
    },

    richtext: (content, cfg, key, item) => {
        const textarea = document.createElement('textarea');
        textarea.className = 'bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 h-24';
        textarea.value = cfg(key);
        textarea.onchange = (e) => cfg(key, e.target.value);
        createBaseElement(content, cfg, key, item, textarea);
    },

    image: (content, cfg, key, item) => {
        const container = document.createElement('div');
        container.className = 'flex flex-col space-y-2';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5';
        input.placeholder = 'Enter image link or choose file';
        input.value = cfg(key) || '';

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.className = 'block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none';

        const preview = document.createElement('img');
        preview.className = 'max-w-xs max-h-48 object-contain';
        preview.src = cfg(key) || '';
        preview.style.display = cfg(key) ? 'block' : 'none';

        const updateImage = (src) => {
            preview.src = src;
            preview.style.display = src ? 'block' : 'none';
            cfg(key, src);
        };

        input.onchange = (e) => updateImage(e.target.value);
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    updateImage(e.target.result);
                    input.value = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        };

        container.append(input, fileInput, preview);
        createBaseElement(content, cfg, key, item, container);
    },

    color: (content, cfg, key, item) => {
        const container = document.createElement('div');
        container.className = 'flex space-x-2';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5';
        input.placeholder = '#000000';
        input.value = cfg(key) || '';

        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.className = 'h-10 w-10 border-0 rounded';
        colorPicker.value = cfg(key) || '#000000';

        const updateColor = (color) => {
            input.value = color;
            colorPicker.value = color;
            cfg(key, color);
        };

        input.onchange = (e) => {
            const color = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                updateColor(color);
            }
        };

        colorPicker.onchange = (e) => updateColor(e.target.value);

        container.append(input, colorPicker);
        createBaseElement(content, cfg, key, item, container);
    },

    number: (content, cfg, key, item) => {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5';
        input.value = cfg(key);
        input.onchange = (e) => cfg(key, parseFloat(e.target.value));
        createBaseElement(content, cfg, key, item, input);
    }
};


function createInputElement(type) {
    return (content, cfg, key, item) => {
        const input = document.createElement('input');
        input.type = type;
        input.className = 'bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5';
        input.value = cfg(key);
        input.onchange = (e) => cfg(key, type === 'number' ? parseFloat(e.target.value) : e.target.value);
        createBaseElement(content, cfg, key, item, input);
    };
}

// Generate settings UI
function generateSettingsUI(root, props, cfg) {
    Object.entries(props).forEach(([key, item]) => {
        const content = root.querySelector(`#content-${item.category}-container`);
        if (content && settingWidgetCreators[item.type]) {
            settingWidgetCreators[item.type](content, cfg, key, item);
        } else {
            console.error(`generateSettingsUI: Can't find category ${item.category}`);
        }
    });
}

// Initialize
generateCategoryTabs();
generateSettingsUI(root, props, cfg);
elements.floatingBall.click();

_openConfigPanel = () => elements.floatingBall.click();
