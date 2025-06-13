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

    // 函数：根据传入的照片数据数组渲染画廊
    function displayPhotos(photos) {
        galleryContainer.innerHTML = ''; // 清空画廊内容
        
        // 只显示最新9张照片
        const photosToDisplay = photos.slice(-9); 

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

    // 函数：根据搜索输入框内容筛选照片
    function filterGallery() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let filteredPhotos = [];

        if (searchTerm === '') {
            filteredPhotos = allPhotosData; // 如果搜索词为空，显示所有照片
        } else {
            filteredPhotos = allPhotosData.filter(item => {
                // 筛选逻辑：检查 full_address 是否包含搜索词（不区分大小写）
                // 确保 item.full_address 存在且是字符串类型
                return item.full_address && typeof item.full_address === 'string' && item.full_address.toLowerCase().includes(searchTerm);
            });
        }
        displayPhotos(filteredPhotos);
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
            displayPhotos(allPhotosData); // 初始显示所有照片
        })
        .catch(error => {
            console.error('Error fetching or parsing data:', error);
            galleryContainer.innerHTML = `<p>加载照片失败: ${error.message || error}. 请检查 data.json 文件或控制台获取更多信息。</p>`;
        });

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
});