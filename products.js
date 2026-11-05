
async function loadProductsFromAPI() {
    try {
        const response = await fetch("https://fakestoreapi.com/products");

        if (!response.ok) {
            throw new Error("Không thể lấy dữ liệu sản phẩm");
        }

        const products = await response.json();

        const xmlDoc = document.implementation.createDocument(
            "",
            "Products",
            null
        );

        products.forEach(product => {
            const productElement = xmlDoc.createElement("Product");

            const fields = [
                "id",
                "title",
                "price",
                "description",
                "category",
                "image"
            ];

            fields.forEach(field => {
                const element = xmlDoc.createElement(field);
                element.textContent = product[field];
                productElement.appendChild(element);
            });

            const rating = xmlDoc.createElement("Rating");

            const rate = xmlDoc.createElement("Rate");
            rate.textContent = product.rating.rate;

            const count = xmlDoc.createElement("Count");
            count.textContent = product.rating.count;

            rating.appendChild(rate);
            rating.appendChild(count);

            productElement.appendChild(rating);
            xmlDoc.documentElement.appendChild(productElement);
        });

        const serializer = new XMLSerializer();
        const xmlString = serializer.serializeToString(xmlDoc);

        const blob = new Blob(
            [xmlString],
            { type: "application/xml" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "products.xml";
        link.click();

        URL.revokeObjectURL(url);

        console.log("Đã chuyển dữ liệu JSON sang XML!");
        console.log("Số sản phẩm:", products.length);

        return products;

    } catch (error) {
        console.error("Lỗi lấy API:", error);
    }
}


function showSkeletonLoading() {
    const productList = document.getElementById("product-list");

    productList.innerHTML = "";

    for (let i = 0; i < 8; i++) {
        const skeletonCard = document.createElement("article");
        skeletonCard.className = "skeleton-card";

        const skeletonImage = document.createElement("div");
        skeletonImage.className = "skeleton skeleton-image";

        const skeletonTitle = document.createElement("div");
        skeletonTitle.className = "skeleton skeleton-text";

        const skeletonPrice = document.createElement("div");
        skeletonPrice.className = "skeleton skeleton-text";

        skeletonCard.appendChild(skeletonImage);
        skeletonCard.appendChild(skeletonTitle);
        skeletonCard.appendChild(skeletonPrice);

        productList.appendChild(skeletonCard);
    }
}


async function loadProductsFromXML() {
    try {
        showSkeletonLoading();

        const response = await fetch("data/products.xml");

        if (!response.ok) {
            throw new Error("Không thể đọc file products.xml");
        }

        const xmlText = await response.text();
        const parser = new DOMParser();

        const xmlDoc = parser.parseFromString(
            xmlText,
            "application/xml"
        );

        if (xmlDoc.querySelector("parsererror")) {
            throw new Error("File XML không hợp lệ");
        }

        const products = xmlDoc.querySelectorAll("Product");
        const productList = document.getElementById("product-list");

        productList.innerHTML = "";

        products.forEach(product => {
            const id = product.querySelector("id")?.textContent;
            const title = product.querySelector("title")?.textContent;
            const price = Number(product.querySelector("price")?.textContent);
            const image = product.querySelector("image")?.textContent;
            const category = product.querySelector("category")?.textContent;
            const rate = Number(product.querySelector("Rating Rate")?.textContent);

            const colors = Array.from(
                product.querySelectorAll("Colors Color")
            ).map(color => color.textContent);

            const stock = product.querySelector("Stock")?.textContent;

            const productCard = document.createElement("article");

            productCard.dataset.id = id;
            productCard.dataset.category = category;
            productCard.dataset.rating = rate;
            productCard.dataset.colors = colors.join(",");
            productCard.dataset.title = title;
            productCard.dataset.price = price;

            const productImage = document.createElement("img");
            productImage.src = image;
            productImage.alt = title;
            productImage.width = 150;

            const productTitle = document.createElement("h3");
            productTitle.textContent = title;

            const productCategory = document.createElement("p");
            productCategory.textContent = "Danh mục: " + category;

            const productPrice = document.createElement("p");
            productPrice.className = "product-price";
            productPrice.dataset.price = price;
            productPrice.textContent = "Giá: $" + price.toFixed(2);

            const productRating = document.createElement("p");
            productRating.textContent = "Đánh giá: " + rate + " sao";

            const productColor = document.createElement("p");
            productColor.textContent = "Màu sắc: " + colors.join(", ");

            const productStock = document.createElement("p");
            productStock.textContent = "Tồn kho: " + (stock || 0);

            const productId = document.createElement("p");
            productId.textContent = "Mã sản phẩm: " + id;

            productCard.appendChild(productImage);
            productCard.appendChild(productTitle);
            productCard.appendChild(productCategory);
            productCard.appendChild(productPrice);
            productCard.appendChild(productRating);
            productCard.appendChild(productColor);
            productCard.appendChild(productStock);
            productCard.appendChild(productId);

            const colorSelect = document.createElement("select");
            colorSelect.className = "product-color";

            colors.forEach(color => {
                const option = document.createElement("option");
                option.value = color;
                option.textContent = color;
                colorSelect.appendChild(option);
            });

            const sizeSelect = document.createElement("select");
            sizeSelect.className = "product-size";

            ["S", "M", "L", "XL"].forEach(size => {
                const option = document.createElement("option");
                option.value = size;
                option.textContent = size;
                sizeSelect.appendChild(option);
            });

            const addButton = document.createElement("button");
            addButton.type = "button";
            addButton.textContent = "Thêm vào giỏ hàng";
            addButton.className = "add-to-cart";
            addButton.dataset.id = id;
            addButton.dataset.action = "add";

            const quickViewButton = document.createElement("button");
            quickViewButton.type = "button";
            quickViewButton.textContent = "Xem nhanh";
            quickViewButton.className = "quick-view";
            quickViewButton.dataset.id = id;
            quickViewButton.dataset.action = "view";

            productCard.appendChild(colorSelect);
            productCard.appendChild(sizeSelect);
            productCard.appendChild(addButton);
            productCard.appendChild(quickViewButton);

            productList.appendChild(productCard);
        });

        console.log("Đã đọc XML thành công!");
        console.log("Số sản phẩm hiển thị:", products.length);

    } catch (error) {
        console.error("Lỗi đọc XML:", error);

        document.getElementById("product-list").textContent =
            "Không thể tải danh sách sản phẩm.";
    }
}


function setupProductEventDelegation() {
    const productList = document.getElementById("product-list");

    productList.addEventListener("click", function(event) {
        const button = event.target.closest("button");

        if (!button || !productList.contains(button)) {
            return;
        }

        const productId = button.dataset.id;
        const action = button.dataset.action;

        const productCard = button.closest("article");

        const selectedColor = productCard.querySelector(".product-color").value;
        const selectedSize = productCard.querySelector(".product-size").value;

        const variant = selectedColor + "-" + selectedSize;

        button.dataset.variant = variant;

        console.log("Mã sản phẩm:", productId);
        console.log("Phiên bản:", button.dataset.variant);

        if (action === "add") {
            const title = productCard.dataset.title;
            const price = Number(productCard.dataset.price);
            const image = productCard.querySelector("img").src;

            cart.addItem({
                id: productId,
                title: title,
                price: price,
                image: image,
                color: selectedColor,
                size: selectedSize
            });

            alert("Đã thêm sản phẩm vào giỏ hàng!");
        }

        if (action === "view") {
            const title = productCard.dataset.title;
            const price = Number(productCard.dataset.price);

            alert(
                "XEM NHANH SẢN PHẨM\n\n" +
                "Tên: " + title +
                "\nGiá: $" + price.toFixed(2) +
                "\nMàu: " + selectedColor +
                "\nKích thước: " + selectedSize
            );
        }
    });
}


function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/men's/g, "men")
        .replace(/women's/g, "women")
        .replace(/[^a-z0-9]/g, "");
}


function setupProductSearch() {
    const searchForm = document.getElementById("search-form");

    if (!searchForm) {
        return;
    }

    searchForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const keyword = normalizeText(
            document.getElementById("keyword").value.trim()
        );

        const minPrice = document.getElementById("min-price").value;
        const maxPrice = document.getElementById("max-price").value;
        const color = document.getElementById("color").value;
        const rating = document.getElementById("rating").value;
        const category = document.getElementById("category").value;

        if (
            minPrice !== "" &&
            maxPrice !== "" &&
            Number(minPrice) > Number(maxPrice)
        ) {
            alert("Giá thấp nhất không được lớn hơn giá cao nhất!");
            return;
        }

        const products = document.querySelectorAll("#product-list article");
        let matchedCount = 0;

        products.forEach(product => {
            const title = product.querySelector("h3").textContent;

            const price = Number(
                product.querySelector(".product-price").dataset.price
            );

            const productCategory = product.dataset.category;
            const productRating = Number(product.dataset.rating);
            const productColors = product.dataset.colors.split(",");

            const searchableText = normalizeText(
                title + " " + productCategory
            );

            const matchKeyword =
                keyword === "" || searchableText.includes(keyword);

            const matchMinPrice =
                minPrice === "" || price >= Number(minPrice);

            const matchMaxPrice =
                maxPrice === "" || price <= Number(maxPrice);

            const matchColor =
                color === "" || productColors.includes(color);

            const matchRating =
                rating === "" || productRating >= Number(rating);

            const matchCategory =
                category === "" ||
                normalizeText(productCategory) === normalizeText(category);

            const isMatched =
                matchKeyword &&
                matchMinPrice &&
                matchMaxPrice &&
                matchColor &&
                matchRating &&
                matchCategory;

            product.style.display = isMatched ? "" : "none";

            if (isMatched) {
                matchedCount++;
            }
        });

        let resultMessage = document.getElementById("search-result");

        if (!resultMessage) {
            resultMessage = document.createElement("p");
            resultMessage.id = "search-result";
            document.getElementById("product-list").before(resultMessage);
        }

        resultMessage.textContent =
            "Tìm thấy " + matchedCount + " sản phẩm.";
    });

    searchForm.addEventListener("reset", function() {
        setTimeout(function() {
            document.querySelectorAll("#product-list article").forEach(product => {
                product.style.display = "";
            });

            const resultMessage = document.getElementById("search-result");

            if (resultMessage) {
                resultMessage.textContent = "Hiển thị tất cả sản phẩm.";
            }
        }, 0);
    });
}


document.addEventListener("DOMContentLoaded", async function() {
    await loadProductsFromXML();
    setupProductSearch();
    setupProductEventDelegation();
    await loadReviewsFromXML();
});
