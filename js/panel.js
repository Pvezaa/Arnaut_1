async function fetchProductTypes() {
    try {
     
      const response = await fetch('http://localhost:9091/api/v1/product-types');
      const data = await response.json();
  
      if (data.content && Array.isArray(data.content)) {
        const categorytable = document.querySelector('.categorylist');
      
  
        // Создаем таблицы категорий
        data.content.forEach(item => {
          const table=document.createElement('div');
          table.classList.add('one-category');
          table.classList.add(`item-${item.id}`);
          table.innerHTML=`
          <h3>${item.name}</h3>
                <table class="category-items table">
                    <thead>
                      <tr>
                        <th style="text-align: center;">№</th>
                        <th style="text-align: center;">Название</th>
                        <th style="text-align: center;">Цена</th>
                        <th style="text-align: center;">Описание</th>
                        <th style="text-align: center;">Время готовки</th>
                        <th style="text-align: center;">Изображение</th>
                        <th class="allbuttons">
                        <button class="delete btn btn-success" data-bs-toggle="modal" data-bs-target="#Modalwindow" data-category-id=${item.id} ><i class='bx bx-book-add' ></i></button>
                        <button class="delete category-delete  btn btn-danger" data-delete="${item.id}" data-category-id="${item.id}"><i class='bx bx-trash-alt'></i></button>
                        </th>
                      </tr>
                    </thead>
                    <tbody class="catlist">
  
                    </tbody>
                  </table>
          `;
          categorytable.appendChild(table);
        });
  
        // После загрузки категорий загружаем меню
        const categoryIds = data.content.map(item => item.id); // Извлекаем IDs
        await Addtable(categoryIds);
        document.querySelector('.categorylist').addEventListener('click', async (event) => {
            if (event.target.closest('.delete-item')) {
                const button = event.target.closest('.btn-danger');
                const productId = button.getAttribute('data-delete');
                await deleteProduct(productId);
                // Удаляем строку из таблицы
                const row = button.closest('tr');
                row.remove();
            }
            if (event.target.closest('.delete')) {
                const button = event.target.closest('.delete');
                const typeName = button.getAttribute('data-category-id'); // Получаем categoryId из кнопки
                console.log('Переданный тип продукта:', typeName);
        
                // Заполняем скрытое поле для типа продукта в модальном окне
                document.getElementById('typename').value = typeName;
            }
            if (event.target.closest('.category-delete')) {
                const button = event.target.closest('.category-delete');
                const categoryId = button.getAttribute('data-delete');
                await deleteCategory(categoryId);
                // Удаляем категорию (всю таблицу)
                const categoryDiv = button.closest('.one-category');
                categoryDiv.remove();
            }
            if(event.target.closest('.change-button')){
                const button= event.target.closest('.change-button');
                const row = button.closest('tr');
                const name = row.cells[1].innerText;
                const price = row.cells[2].innerText;
                const description = row.cells[3].innerText;
                const time = row.cells[4].innerText;

                // Заполняем модальное окно
                document.getElementById('name').value = name;
                document.getElementById('price').value = price;
                document.getElementById('description').value = description;
                document.getElementById('time').value = time;
            }
        });
        let Modal = new bootstrap.Modal(document.getElementById('Modalwindow'), {
            keyboard: false
        });
       
        document.querySelector('button.confirm').addEventListener('click', function(e) {
            let name = document.getElementById('name').value;
            let price = document.getElementById('price').value;
            let description = document.getElementById('description').value;
            let img = document.getElementById('image').files[0]; // Получаем выбранный файл
            let cookingTime= document.getElementById('time').value;
            let typeName = document.getElementById('typename').value;
            if (name && price && description) {
               
                
        
                // Очистка полей формы
                document.getElementById('name').value = '';
                document.getElementById('price').value = '';
                document.getElementById('description').value = '';
                document.getElementById('image').value = '';
                document.getElementById('time').value = '';
        
                // Закрыть модальное окно
                
        
                let newProduct={
                    name: name,
                    price: price,
                    typeName: typeName,
                    description: description,
                    cookingTime: cookingTime
                };
                console.log(newProduct);
                const formData=new FormData(); 
                formData.append('name', newProduct.name);
                formData.append('description', newProduct.description);
                formData.append('typeId', newProduct.typeName);
                formData.append('price', newProduct.price);
                formData.append('cookingTime', newProduct.cookingTime);
                formData.append('file', img);
                

                Modal.hide();
                fetch('http://localhost:9091/api/v1/products', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        // Обработка ошибки на уровне HTTP
                        throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
                    }
                    return response.text().then(text => text ? JSON.parse(text) : {});
                })
                .then(data => {
                    console.log('Success:', data);
                    // уведомление о успехе
                    Addtable(categoryIds);
                })
                .catch(error => {
                    console.error('Error:', error);
                    // уведомление о неудаче
                });
            } else {
                alert('Пожалуйста, заполните все поля');
            }
        });
        
        
      } else {
        console.error('Неверный формат данных:', data);
      }
    } catch (error) {
      console.error('Ошибка при запросе данных категорий:', error);
    }
  }
async function Addtable(categoryIds){
    try{
        for(const id of categoryIds){
            const response = await fetch(`http://localhost:9091/api/v1/products?typeId=${id}`);
            const data = await response.json();
            const tableone=document.querySelector(`.item-${id}`);

            const tbody=tableone.querySelector(`.catlist`);
            tbody.innerHTML = '';
            let i=0;
            if (data.content && Array.isArray(data.content)) {
                for(const item of data.content){
                    tbody.insertAdjacentHTML('beforeend', `
                        <tr>
                          <td style="text-align: center;">${i + 1}</td>
                          <td style="text-align: center;">${item.name}</td>
                          <td style="text-align: center;">${item.price}</td>
                          <td style="text-align: center;">${item.description}</td>
                          <td style="text-align: center;">${item.cookingTime}</td>
                          <td style="text-align: center;">Изобржение</td>
                          <td style="text-align: center;" class="allbuttons">
                          <button class="delete change-button btn btn-success" data-delete="${item.id}" data-bs-toggle="modal" data-bs-target="#Modalwindow"><i class='bx bxs-edit-alt'></i></button>
                          <button class="delete delete-item btn btn-danger" data-delete="${item.id}"><i class='bx bx-trash-alt'></i></button>
                          </td>
                          </tr>
                      `);
                      i+=1;
                }
            }
        }
    }
    catch (error) {
        console.error('Ошибка при запросе данных меню:', error);
      }
}
async function deleteProduct(productId) {
    try {
        const response = await fetch(`http://localhost:9091/api/v1/products/${productId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Ошибка при удалении продукта с ID ${productId}`);
        }
        console.log(`Продукт с ID ${productId} успешно удален`);
    } catch (error) {
        console.error('Ошибка при удалении продукта:', error);
    }
}
async function deleteCategory(categoryId) {
    try {
        const response = await fetch(`http://localhost:9091/api/v1/product-types/${categoryId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Ошибка при удалении категории с ID ${categoryId}`);
        }
        console.log(`Категория с ID ${categoryId} успешно удалена`);
    } catch (error) {
        console.error('Ошибка при удалении категории:', error);
    }
}

fetchProductTypes();
