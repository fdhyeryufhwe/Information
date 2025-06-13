document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('gallery');
    const searchInput = document.getElementById('searchInput'); // 获取搜索输入框元素
    const warningModal = document.getElementById('warningModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const imageModal = document.getElementById('imageModal'); // 新增：图片模态框
    const fullImage = document.getElementById('fullImage');   // 新增：模态框内的图片元素
    const imageCaption = document.getElementById('caption'); // 新增：图片标题
    const imageModalCloseBtn = imageModal ? imageModal.querySelector('.close-button') : null; // 新增：图片模态框关闭按钮
    let allPhotosData = []; // 用于存储所有照片数据的数组
    let currentPage = 1;
    const itemsPerPage = 9; // 每页显示9张照片
    let paginatedPhotos = []; // 用于分页的照片数据

    // Key management variables
    let validKeys = [];

    loadKeysConfig();

    // 函数：根据传入的照片数据数组渲染画廊
    function displayPhotos(photos) {
        galleryContainer.innerHTML = ''; // 清空画廊内容
        
        // 根据当前页码显示照片
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const photosToDisplay = photos.slice(startIndex, endIndex);

        if (photosToDisplay.length === 0) {
            galleryContainer.innerHTML = '<p>没有找到匹配的照片。</p>';
            return;
        }

        photosToDisplay.forEach(item => {
            const photoCard = document.createElement('div');
            photoCard.classList.add('photo-card');

            const img = document.createElement('img');
            img.src = item.photo_path; // 假设 photo_path 包含正确的图片路径，例如 ./images/xxx.jpg
            img.alt = item.full_address || '照片';
            img.onerror = () => {
                img.src = './images/placeholder.jpg'; // 如果图片加载失败，显示占位符图片
                img.alt = '图片加载失败';
            };

            // 添加点击事件监听器，显示完整照片
            img.addEventListener('click', () => {
                if (imageModal && fullImage && imageCaption) {
                    fullImage.src = item.photo_path; // 显示完整尺寸的图片
                    imageCaption.textContent = item.full_address || '无地址信息';
                    imageModal.style.display = 'flex'; // 显示模态框
                }
            });

            const cardContent = document.createElement('div');
            cardContent.classList.add('card-content');

            const title = document.createElement('h3');
            title.textContent = item.full_address || '无地址信息';

            cardContent.appendChild(title);

            if (item.age) {
                const age = document.createElement('p');
                age.innerHTML = `<strong>年龄:</strong> ${item.age}`;
                cardContent.appendChild(age);
            }
            if (item.price) {
                const price = document.createElement('p');
                price.innerHTML = `<strong>价格:</strong> ${item.price}`;
                cardContent.appendChild(price);
            }
            if (item.height) {
                const height = document.createElement('p');
                height.innerHTML = `<strong>身高:</strong> ${item.height}`;
                cardContent.appendChild(height);
            }
            if (item.weight) {
                const weight = document.createElement('p');
                weight.innerHTML = `<strong>体重:</strong> ${item.weight}`;
                cardContent.appendChild(weight);
            }

            photoCard.appendChild(img);
            photoCard.appendChild(cardContent);

            galleryContainer.appendChild(photoCard);
        });
    }

    // 函数：设置分页按钮
    function setupPagination(photos) {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return; // 确保分页容器存在
        paginationContainer.innerHTML = ''; // 清空现有按钮

        const totalPages = Math.ceil(photos.length / itemsPerPage);

        if (totalPages > 1) {
            // 添加上一页按钮
            const prevButton = document.createElement('button');
            prevButton.textContent = '上一页';
            prevButton.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayPhotos(paginatedPhotos);
                    updatePaginationButtons();
                }
            });
            paginationContainer.appendChild(prevButton);

            // 添加页码按钮
            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('button');
                pageButton.textContent = i;
                pageButton.addEventListener('click', () => {
                    currentPage = i;
                    displayPhotos(paginatedPhotos);
                    updatePaginationButtons();
                });
                paginationContainer.appendChild(pageButton);
            }

            // 添加下一页按钮
            const nextButton = document.createElement('button');
            nextButton.textContent = '下一页';
            nextButton.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    displayPhotos(paginatedPhotos);
                    updatePaginationButtons();
                }
            });
            paginationContainer.appendChild(nextButton);
        }
        updatePaginationButtons();
    }

    // 函数：更新分页按钮状态
    function updatePaginationButtons() {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;
        const buttons = paginationContainer.querySelectorAll('button');
        const totalPages = Math.ceil(paginatedPhotos.length / itemsPerPage);

        buttons.forEach(button => {
            button.classList.remove('active');
            button.disabled = false; // Enable all buttons by default

            if (button.textContent === String(currentPage)) {
                button.classList.add('active');
                button.disabled = true; // Disable current page button
            }
            if (button.textContent === '上一页' && currentPage === 1) {
                button.disabled = true;
            }
            if (button.textContent === '下一页' && currentPage === totalPages) {
                button.disabled = true;
            }
        });
    }

    // 获取 data.json 数据并初始化画廊
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('data.json not found. Please ensure the file exists and is accessible.');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            return response.json();
        })
        .then(data => {
            allPhotosData = data; // 保存原始数据
            paginatedPhotos = data; // 初始化分页数据
            setupPagination(paginatedPhotos); // 设置分页
            displayPhotos(paginatedPhotos); // 初始显示第一页照片
        })
        .catch(error => {
            console.error('Error fetching or parsing data:', error);
            galleryContainer.innerHTML = `<p>加载照片失败: ${error.message || error}. 请检查 data.json 文件或控制台获取更多信息。</p>`;
        });

    // 修改 filterGallery 函数，使其在筛选后也更新分页
    function filterGallery() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let filteredPhotos = [];

        if (searchTerm === '') {
            filteredPhotos = allPhotosData; // 如果搜索词为空，显示所有照片
        } else {
            filteredPhotos = allPhotosData.filter(item => {
                return item.full_address && typeof item.full_address === 'string' && item.full_address.toLowerCase().includes(searchTerm);
            });
        }
        paginatedPhotos = filteredPhotos; // 更新分页数据源
        currentPage = 1; // 重置到第一页
        setupPagination(paginatedPhotos); // 重新设置分页按钮
        displayPhotos(paginatedPhotos); // 显示第一页筛选结果
    }

    // 为搜索输入框添加事件监听器
    searchInput.addEventListener('input', filterGallery);

    // 显示警告模态框
    if (warningModal && closeModalBtn) {
        warningModal.style.display = 'flex';
        closeModalBtn.addEventListener('click', () => {
            warningModal.style.display = 'none';
        });

        // 点击模态框外部区域也可以关闭
        window.addEventListener('click', (event) => {
            if (event.target === warningModal) {
                warningModal.style.display = 'none';
            }
        });
    }

    // 图片模态框关闭逻辑
    if (imageModal && imageModalCloseBtn) {
        imageModalCloseBtn.addEventListener('click', () => {
            imageModal.style.display = 'none';
        });
        window.addEventListener('click', (event) => {
            if (event.target === imageModal) {
                imageModal.style.display = 'none';
            }
        });
    }

    // Key entry modal event listener
    document.getElementById('submitKeyButton').addEventListener('click', validateKey);

    // Initial warning modal display
    showWarningModal("本站为信息付费，并不对寻欢经历负责，请注意个人防范。\n\n凡是有要求路费/上门/定金/保证金/照片验证/视频验证/提前付费等类似行为的都是骗子，同时也请注意任何形式的推荐办卡行为，请勿上当受骗。\n\n碰到有问题的信息，请及时举报给我们删除信息。如果发布的信息涉及个人隐私，也请及时举报，我们会核实后第一时间帮你删除处理。");
});

async function loadKeysConfig() {
    try {
        const response = await fetch('keys_config.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        validKeys = await response.json();
        console.log('Keys config loaded:', validKeys);
    } catch (error) {
        console.error('Error loading keys config:', error);
        document.getElementById('keyMessage').textContent = '无法加载密钥配置，请联系管理员。';
        // Optionally, prevent access if keys cannot be loaded
    }
}

async function validateKey() {
    const keyInput = document.getElementById('keyInput').value.trim();
    const keyMessage = document.getElementById('keyMessage');
    keyMessage.textContent = ''; // Clear previous messages

    if (!keyInput) {
        keyMessage.textContent = '请输入密钥。';
        return;
    }

    // Hash the input key for comparison
    const encoder = new TextEncoder();
    const data = encoder.encode(keyInput);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashedKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string

    console.log('Input key:', keyInput);
    console.log('Hashed input key:', hashedKey);

    const now = Date.now() / 1000; // current time in seconds (Unix timestamp)

    let isValid = false;
    for (const key of validKeys) {
        if (key.hash === hashedKey) {
            if (key.exp === null) { // Permanent key
                isValid = true;
                break;
            } else if (key.exp > now) { // Timed key and not expired
                isValid = true;
                break;
            }
        }
    }

    if (isValid) {
        document.getElementById('key-entry-modal').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        loadPhotos(); // Load content after successful validation
    } else {
        keyMessage.textContent = '密钥无效或已过期，请重试或联系管理员。';
    }
}

function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
}

function showWarningModal(message) {
    document.getElementById('warningMessage').textContent = message;
    document.getElementById('warningModal').style.display = 'flex'; // Use flex to center
}

function closeWarningModal() {
    document.getElementById('warningModal').style.display = 'none';
}