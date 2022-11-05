// RENDER DE PRODUCTOS (CATALOGO)
//////////////////////////////////////////////////////////
fetchOnLoad();

function fetchOnLoad() {
    window.addEventListener("DOMContentLoaded", () => {
        loadJSON();
    })
};

function loadJSON() {
    fetch("products.json")
        .then(response => response.json())
        .then(function (productList) {
            let placeholder = document.querySelector("#items-list");
            let html = "";

            for (let product of productList) {
                html += `
                <div class="col d-flex justify-content-center mb-4 item-container ${product.gender} wow animate__fadeIn">
                    <div class="card shadow mb-2 bg-dark text-light" style="width: 18rem;">
                        <h5 class="card-title p-2 text-center">${product.title}</h5>
                        <img src="${product.img}" class="card-img bg-light" alt="...">
                        <div class="card-body">
                            <p class="card-text description text-white-50">${product.description}</p>
                            <h3 class="text-primary text-center py-2">Precio $ <span class="precio">${product.price}</span>.-</h3>
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary" id="button-buy">Agregar al Carro</button>
                            </div>
                            <p class="text-muted my-0">En stock: <span class="stock">${product.qtty}</span></p>
                        </div>
                    </div>
                </div>
                `;
            }
            placeholder.innerHTML = html;
        })

//////////////////////////////////////////////////////////

        .then(returnedData => {
            const addtoCartButton = document.querySelectorAll("#button-buy");
            const tableBody = document.querySelector(".table-body");
            let cart = [];

            addtoCartButton.forEach(btn => {
                btn.addEventListener("click", addToCart)
            });

            // Map de item

            function addToCart(product) {
                const button = product.target;
                const item = button.closest(".card");
                const itemTitle = item.querySelector(".card-title").textContent;
                const itemPrice = item.querySelector(".precio").textContent;
                const itemImg = item.querySelector(".card-img").src;
                const itemQtty = item.querySelector(".stock").textContent;

                const newItem = {
                    title: itemTitle,
                    precio: itemPrice,
                    img: itemImg,
                    stock: itemQtty,
                    cantidad: 1
                };

                addItemToCart(newItem);

                Swal.fire({
                    icon: 'success',
                    title: 'Agregado al Carro!',
                    showConfirmButton: false,
                    timer: 1200
                });
            };


            // Agregar al carrito

            function addItemToCart(newItem) {
                const inputElement = tableBody.getElementsByClassName("input-element");

                // For para aumentar cantidad en lugar de duplicar item.

                for (let i = 0; i < cart.length; i++) {

                    if (cart[i].title.trim() === newItem.title.trim()) {

                        cart[i].cantidad++;
                        const inputValue = inputElement[i];
                        inputValue.value++;
                        cartTotal()
                        return null;

                    }

                }

                cart.push(newItem);

                renderCart();
            }


            // Render del carro

            function renderCart() {
                tableBody.innerHTML = "";

                cart.map(item => {
                    const tr = document.createElement("tr");
                    tr.classList.add("cart-item");
                    const content = `
                <th scope="row">1</th>
                  <td class="table--producto d-flex flex-column">
                    <img class="img" src=${item.img} alt="">
                    <h6 class="title">${item.title}</h6>
                    <span class="text-muted">Stock: ${item.stock}</span>
                  </td>
                  <td class="table--precio">
                    <p>$ ${item.precio}.-</p>
                  </td>
                  <td class="table--cantidad">
                    <input type="number" max="${item.stock}" min="1" value="${item.cantidad}" class="me-3 input-element">
                    <button class="delete btn btn-danger"><i class="fas fa-trash"></i></button>
                  </td>
                  `;

                    tr.innerHTML = content;
                    tableBody.appendChild(tr);

                    tr.querySelector(".delete").addEventListener("click", itemRemoveCart);

                    //Cambios por imput manual en carrito

                    tr.querySelector(".input-element").addEventListener("change", sumaCantidad);
                });

                cartTotal();
            }


            // Calculo y render del total 

            function cartTotal() {
                let total = 0;
                const cartTotal = document.querySelector(".cart-total");

                cart.forEach((item) => {
                    const precio = Number(item.precio.replace("$", ""));
                    total = total + precio * item.cantidad;
                })

                cartTotal.innerHTML = `Total $ ${total}.-`;

                //Actualiza Local Storage
                addLocalStorage();
            }


            // Boton para remover item

            function itemRemoveCart(e) {
                Swal.fire({
                    title: 'Estás seguro que deseas quitar el producto?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Si'
                  })
                  .then((result) => {
                    if (result.isConfirmed) {
                        const deleteButton = e.target;
                        const tr = deleteButton.closest(".cart-item");
                        const title = tr.querySelector(".title").textContent;

                        for (let i = 0; i < cart.length; i++) {

                            if (cart[i].title.trim() === title.trim()) {
                                cart.splice(i, 1);
                            }
                        }
        
                        tr.remove();
                        cartTotal();
        
                        Swal.fire({
                            icon: 'error',
                            title: 'Prenda eliminada!',
                            showConfirmButton: false,
                            timer: 1200
                        });
                    }
                  })
            }


            //Cambios por imput manual en carrito

            function sumaCantidad(e) {
                const inputSum = e.target;
                const tr = inputSum.closest(".cart-item");
                const title = tr.querySelector(".title").textContent;

                cart.forEach(item => {
                    if (item.title.trim() === title) {
                        inputSum.value < 1 ? (inputSum.value = 1) : inputSum.value;
                        item.cantidad = inputSum.value;
                        cartTotal();
                    }
                });
            }


            // LOCAL STORAGE

            function addLocalStorage() {
                localStorage.setItem("cart", JSON.stringify(cart));
            }


            window.onload = function () {
                const storage = JSON.parse(localStorage.getItem("cart"));
                if (storage) {
                    cart = storage;
                    renderCart();
                }
            }

            // FILTER

            const filterBtnAll = document.querySelector(".category-btn-all");
            const filterBtnMale = document.querySelector(".category-btn-male");
            const filterBtnFemale = document.querySelector(".category-btn-female");

            filterBtnAll.addEventListener("click", filterAll);
            filterBtnMale.addEventListener("click", filterMale);
            filterBtnFemale.addEventListener("click", filterFemale);

            function filterAll() {
                let allElements = document.querySelectorAll(".item-container");

                for (let elements of allElements) {
                    if (elements.classList.contains("hidden")){
                        elements.classList.remove("hidden");
                    }
                    elements.classList.add("visible");
                }
            }

            function filterMale() {
                let maleElements = document.querySelectorAll(".male");
                let femaleElements = document.querySelectorAll(".female");
                

                for (let elements of femaleElements) {
                    if (elements.classList.contains("visible")){
                        elements.classList.remove("visible");
                    }
                    elements.classList.add("hidden");
                }

                for (let elements of maleElements) {
                    if (elements.classList.contains("hidden")){
                        elements.classList.remove("hidden");
                    }
                    elements.classList.add("visible");
                }
            }

            function filterFemale() {
                let maleElements = document.querySelectorAll(".male");
                let femaleElements = document.querySelectorAll(".female");
                

                for (let elements of femaleElements) {
                    if (elements.classList.contains("hidden")){
                        elements.classList.remove("hidden");
                    }
                    elements.classList.add("visible");
                }

                for (let elements of maleElements) {
                    if (elements.classList.contains("visible")){
                        elements.classList.remove("visible");
                    }
                    elements.classList.add("hidden");
                }
            }


        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Live Server es requerido para el funcionamiento de la app.',
                showConfirmButton: true,
            });
        })
}