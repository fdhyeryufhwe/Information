document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('gallery-container');

    // 从 data.json 文件中加载照片数据
    fetch('data.json')
        .then(response => response.json())
        .then(photoData => {
            photoData.forEach(item => {
                const galleryItem = document.createElement('div');
                galleryItem.classList.add('gallery-item');

                const img = document.createElement('img');
                img.src = item.photo_path;
                img.alt = item.full_address;

                const address = document.createElement('h3');
                address.textContent = item.full_address;

                const details = document.createElement('p');
                details.innerHTML = `
                    年龄: ${item.age || 'N/A'}<br>
                    价格: ${item.price || 'N/A'}<br>
                    身高: ${item.height || 'N/A'}<br>
                    体重: ${item.weight || 'N/A'}
                `;

                galleryItem.appendChild(img);
                galleryItem.appendChild(address);
                galleryItem.appendChild(details);

                galleryContainer.appendChild(galleryItem);
            });
        })
        .catch(error => {
            console.error('Error fetching photo data:', error);
            galleryContainer.innerHTML = '<p>加载照片数据失败。</p>';
        });
});