
document.addEventListener("DOMContentLoaded", function () {

    // Lấy các phần tử HTML
    const form = document.getElementById("checkout-form");

    const nameInput = document.getElementById("customer-name");
    const emailInput = document.getElementById("customer-email");
    const phoneInput = document.getElementById("customer-phone");
    const addressInput = document.getElementById("customer-address");

    const totalElement = document.getElementById("checkout-total");

    const emailError = document.getElementById("email-error");
    const phoneError = document.getElementById("phone-error");
    const message = document.getElementById("checkout-message");

    // Đọc giỏ hàng từ LocalStorage
    function getCart() {
        return JSON.parse(localStorage.getItem("cart")) || {};
    }

    // Regex kiểm tra email
    const emailRegex =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Regex kiểm tra số điện thoại Việt Nam
    const phoneRegex =
        /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

    // Tính tổng tiền giỏ hàng
    function calculateTotal() {

        const cart = getCart();

        let total = 0;

        Object.values(cart).forEach(function (item) {

            total += Number(item.price) * Number(item.quantity);

        });

        totalElement.textContent =
            "Tổng tiền: $" + total.toFixed(2);

        return total;
    }

    calculateTotal();

    // Kiểm tra email
    function validateEmail() {

        const email = emailInput.value.trim();

        if (!emailRegex.test(email)) {

            emailError.textContent =
                "Email không đúng định dạng!";

            return false;
        }

        emailError.textContent = "";

        return true;
    }

    // Kiểm tra số điện thoại
    function validatePhone() {

        const phone = phoneInput.value.trim();

        if (!phoneRegex.test(phone)) {

            phoneError.textContent =
                "SĐT phải có 10 số, bắt đầu bằng 03, 05, 07, 08, 09 hoặc +84!";

            return false;
        }

        phoneError.textContent = "";

        return true;
    }

    // Kiểm tra ngay khi nhập
    emailInput.addEventListener("keyup", validateEmail);
    emailInput.addEventListener("blur", validateEmail);

    phoneInput.addEventListener("keyup", validatePhone);
    phoneInput.addEventListener("blur", validatePhone);

    // Xử lý thanh toán
    form.addEventListener("submit", function (event) {

        event.preventDefault();

        message.textContent = "";
        message.className = "";

        // Kiểm tra dữ liệu
        const isEmailValid = validateEmail();
        const isPhoneValid = validatePhone();

        if (!isEmailValid || !isPhoneValid) {

            alert("Vui lòng kiểm tra lại email và số điện thoại!");

            return;
        }

        // Kiểm tra họ tên
        if (nameInput.value.trim().length < 2) {

            alert("Vui lòng nhập họ tên hợp lệ!");

            nameInput.focus();

            return;
        }

        // Kiểm tra địa chỉ
        if (addressInput.value.trim().length < 5) {

            alert("Vui lòng nhập địa chỉ giao hàng!");

            addressInput.focus();

            return;
        }

        // Lấy giỏ hàng mới nhất
        const cart = getCart();

        if (Object.keys(cart).length === 0) {

            alert("Giỏ hàng đang trống!");

            return;
        }

        // Kiểm tra dữ liệu sản phẩm
        const products = Object.values(cart);

        const validCart = products.every(function (item) {
            return Number.isFinite(Number(item.price)) &&
                Number(item.price) >= 0 &&
                Number.isInteger(Number(item.quantity)) &&
                Number(item.quantity) > 0;
        });

        if (!validCart) {

            alert("Dữ liệu giỏ hàng không hợp lệ!");

            return;
        }

        // Tính tổng tiền
        const total = calculateTotal();

        // Tạo hóa đơn
        const order = {

            orderId: "HD" + Date.now(),

            createdAt: new Date().toISOString(),

            customer: {

                name: nameInput.value.trim(),

                email: emailInput.value.trim(),

                phone: phoneInput.value.trim(),

                address: addressInput.value.trim()

            },

            products: products,

            total: total,

            status: "Đã thanh toán (giả lập)"

        };

        try {

            // Lấy danh sách hóa đơn cũ
            let orders =
                JSON.parse(localStorage.getItem("orders")) || [];

            // Thêm hóa đơn mới
            orders.push(order);

            // Lưu hóa đơn
            localStorage.setItem(
                "orders",
                JSON.stringify(orders)
            );

            // Xóa giỏ hàng
            localStorage.removeItem("cart");

            // Thông báo thành công
            alert(
                "THANH TOÁN THÀNH CÔNG!\n" +
                "Mã hóa đơn: " + order.orderId +
                "\nTổng tiền: $" + order.total.toFixed(2)
            );

            // Reset form
            form.reset();

            // Chuyển về trang chủ
            window.location.href = "index.html";

        } catch (error) {

            alert("Không thể lưu hóa đơn: " + error.message);

        }

    });

});
