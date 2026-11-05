
async function loadReviewsFromXML() {
    try {
        const response = await fetch("data/reviews.xml");

        if (!response.ok) {
            throw new Error("Không thể tải dữ liệu đánh giá");
        }

        const xmlText = await response.text();

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");

        if (xmlDoc.querySelector("parsererror")) {
            throw new Error("File XML không hợp lệ");
        }

        const reviewNodes = xmlDoc.getElementsByTagName("review");
        const reviewsByProduct = {};

        Array.from(reviewNodes).forEach(review => {
            const productId = review.querySelector("product_id").textContent;
            const customerId = review.querySelector("customer_id").textContent;
            const customerName = review.querySelector("customer_name").textContent;
            const rating = Number(review.querySelector("rating").textContent);
            const comment = review.querySelector("comment").textContent;
            const date = review.querySelector("date").textContent;

            if (!reviewsByProduct[productId]) {
                reviewsByProduct[productId] = [];
            }

            reviewsByProduct[productId].push({
                customerId,
                customerName,
                rating,
                comment,
                date
            });
        });

        const averageRatings = {};

        for (const productId in reviewsByProduct) {
            const reviews = reviewsByProduct[productId];

            const totalRating = reviews.reduce(
                (total, review) => total + review.rating,
                0
            );

            averageRatings[productId] = (
                totalRating / reviews.length
            ).toFixed(1);
        }

        displayProductReviews(reviewsByProduct, averageRatings);

        console.log("Danh sách đánh giá:", reviewsByProduct);
        console.log("Điểm trung bình:", averageRatings);

        return {
            reviewsByProduct,
            averageRatings
        };

    } catch (error) {
        console.error("Lỗi đọc đánh giá:", error);
        return null;
    }
}


function displayProductReviews(reviewsByProduct, averageRatings) {
    const products = document.querySelectorAll("#product-list article");

    products.forEach(product => {
        const productId = product.dataset.id;
        const image = product.querySelector("img");

        if (!image) {
            return;
        }

        const reviews = reviewsByProduct[productId] || [];
        const average = averageRatings[productId];

        const imageWrapper = document.createElement("div");
        imageWrapper.className = "product-image-wrapper";

        image.parentNode.insertBefore(imageWrapper, image);
        imageWrapper.appendChild(image);

        const ratingBadge = document.createElement("span");
        ratingBadge.className = "average-rating";

        if (average) {
            ratingBadge.textContent = "★ " + average;
        } else {
            ratingBadge.textContent = "Chưa có đánh giá";
        }

        imageWrapper.appendChild(ratingBadge);

        const reviewButton = document.createElement("button");
        reviewButton.type = "button";
        reviewButton.className = "review-detail-button";
        reviewButton.textContent = "Xem đánh giá (" + reviews.length + ")";

        const reviewContainer = document.createElement("div");
        reviewContainer.className = "review-detail";
        reviewContainer.style.display = "none";

        if (reviews.length > 0) {
            reviews.forEach(review => {
                const reviewItem = document.createElement("div");
                reviewItem.className = "review-item";

                const customer = document.createElement("strong");
                customer.textContent = review.customerName;

                const stars = document.createElement("p");
                stars.className = "review-stars";
                stars.textContent = "★".repeat(review.rating) +
                    "☆".repeat(5 - review.rating);

                const comment = document.createElement("p");
                comment.textContent = review.comment;

                const date = document.createElement("small");
                date.textContent = "Ngày đánh giá: " + review.date;

                reviewItem.appendChild(customer);
                reviewItem.appendChild(stars);
                reviewItem.appendChild(comment);
                reviewItem.appendChild(date);

                reviewContainer.appendChild(reviewItem);
            });
        } else {
            reviewContainer.textContent = "Sản phẩm chưa có đánh giá.";
        }

        reviewButton.addEventListener("click", function() {
            const isHidden = reviewContainer.style.display === "none";

            reviewContainer.style.display = isHidden ? "block" : "none";

            reviewButton.textContent = isHidden
                ? "Ẩn đánh giá"
                : "Xem đánh giá (" + reviews.length + ")";
        });

        product.appendChild(reviewButton);
        product.appendChild(reviewContainer);
    });
}
