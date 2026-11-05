
const cart = {
    items: JSON.parse(localStorage.getItem("cart")) || [],

    addItem: function(product) {
        const existingItem = this.items.find(item =>
            item.id === product.id &&
            item.color === product.color &&
            item.size === product.size
        );

        if (existingItem) {
            existingItem.quantity++;
        } else {
            product.quantity = 1;
            this.items.push(product);
        }

        this.save();
    },

    save: function() {
        localStorage.setItem("cart", JSON.stringify(this.items));
    },

    getTotal: function() {
        return this.items.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
    },

    render: function() {
        const cartList = document.getElementById("cart-list");
        const cartTotal = document.getElementById("cart-total");

        if (!cartList || !cartTotal) {
            return;
        }

        cartList.innerHTML = "";

        if (this.items.length === 0) {
            cartList.innerHTML = "<p>Giỏ hàng đang trống.</p>";
            cartTotal.textContent = "Tổng tiền: $0.00";
            return;
        }

        this.items.forEach((item, index) => {
            const itemElement = document.createElement("article");
            itemElement.className = "cart-item";

            const image = document.createElement("img");
            image.src = item.image;
            image.alt = item.title;

            const title = document.createElement("h3");
            title.textContent = item.title;

            const price = document.createElement("p");
            price.textContent = "Giá: $" + item.price.toFixed(2);

            const variant = document.createElement("p");
            variant.textContent =
                "Màu: " + item.color + " | Kích thước: " + item.size;

            const quantity = document.createElement("p");
            quantity.textContent = "Số lượng: " + item.quantity;

            const decreaseButton = document.createElement("button");
            decreaseButton.type = "button";
            decreaseButton.textContent = "-";
            decreaseButton.dataset.action = "decrease";
            decreaseButton.dataset.index = index;

            const increaseButton = document.createElement("button");
            increaseButton.type = "button";
            increaseButton.textContent = "+";
            increaseButton.dataset.action = "increase";
            increaseButton.dataset.index = index;

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.textContent = "Xóa";
            removeButton.dataset.action = "remove";
            removeButton.dataset.index = index;

            const buttonGroup = document.createElement("div");
            buttonGroup.className = "cart-button-group";

            buttonGroup.appendChild(decreaseButton);
            buttonGroup.appendChild(increaseButton);
            buttonGroup.appendChild(removeButton);

            itemElement.appendChild(image);
            itemElement.appendChild(title);
            itemElement.appendChild(price);
            itemElement.appendChild(variant);
            itemElement.appendChild(quantity);
            itemElement.appendChild(buttonGroup);

            cartList.appendChild(itemElement);
        });

        cartTotal.textContent =
            "Tổng tiền: $" + this.getTotal().toFixed(2);
    }
};


document.addEventListener("DOMContentLoaded", function() {
    const cartList = document.getElementById("cart-list");

    if (cartList) {
        cart.render();

        cartList.addEventListener("click", function(event) {
            const button = event.target.closest("button");

            if (!button || !cartList.contains(button)) {
                return;
            }

            const index = Number(button.dataset.index);
            const action = button.dataset.action;

            if (action === "increase") {
                cart.items[index].quantity++;
            }

            if (action === "decrease") {
                cart.items[index].quantity--;

                if (cart.items[index].quantity <= 0) {
                    cart.items.splice(index, 1);
                }
            }

            if (action === "remove") {
                cart.items.splice(index, 1);
            }

            cart.save();
            cart.render();
        });
    }

    const checkoutButton = document.getElementById("checkout-button");

    if (checkoutButton) {
        checkoutButton.addEventListener("click", function() {
            if (cart.items.length === 0) {
                alert("Giỏ hàng đang trống!");
                return;
            }

            window.location.href = "checkout.html";
        });
    }
});
