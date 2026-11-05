
document.addEventListener("DOMContentLoaded", function () {
    const loginSection = document.getElementById("admin-login");
    const dashboard = document.getElementById("admin-dashboard");
    const loginForm = document.getElementById("admin-login-form");

    const message = document.getElementById("admin-message");

    const adminName = document.getElementById("admin-name");
    const adminRole = document.getElementById("admin-role");

    const totalOrdersElement = document.getElementById("total-orders");
    const totalRevenueElement = document.getElementById("total-revenue");
    const totalProductsSoldElement = document.getElementById("total-products-sold");

    const orderList = document.getElementById("order-list");
    const bestSelling = document.getElementById("best-selling");

    const logoutButton = document.getElementById("admin-logout");

    async function loadEmployees() {
        try {
            const response = await fetch("./data/employees.json");

            if (!response.ok) {
                throw new Error("Không thể đọc employees.json");
            }

            const employees = await response.json();

            if (!Array.isArray(employees)) {
                throw new Error("Dữ liệu nhân viên không hợp lệ");
            }

            return employees;
        } catch (error) {
            console.error("Lỗi đọc nhân viên:", error);

            if (message) {
                message.textContent =
                    "Không thể đọc dữ liệu nhân viên. Hãy kiểm tra file JSON.";
            }

            return null;
        }
    }

    function getOrders() {
        try {
            const data = localStorage.getItem("orders");

            if (!data) {
                return [];
            }

            const orders = JSON.parse(data);

            return Array.isArray(orders) ? orders : [];
        } catch (error) {
            console.error("Lỗi đọc đơn hàng:", error);
            return [];
        }
    }

    function formatMoney(amount) {
        return Number(amount || 0).toLocaleString("vi-VN") + " VNĐ";
    }

    function showDashboard(employee) {
        loginSection.style.display = "none";
        dashboard.style.display = "block";

        adminName.textContent = employee.name;

        adminRole.textContent =
            employee.position + " - " + employee.id;

        renderDashboard();
    }

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        message.textContent = "";

        const email = document
            .getElementById("admin-email")
            .value.trim();

        const password = document
            .getElementById("admin-password")
            .value;

        const employees = await loadEmployees();

        if (!employees) {
            return;
        }

        const employee = employees.find(function (item) {
            return item.email &&
                item.email.toLowerCase() === email.toLowerCase() &&
                item.password === password;
        });

        if (!employee) {
            message.textContent =
                "Email hoặc mật khẩu không chính xác!";
            return;
        }

        if (
            !employee.position ||
            employee.position.toLowerCase() !== "admin"
        ) {
            message.textContent =
                "Tài khoản này không có quyền truy cập Admin!";
            return;
        }

        const adminAccount = {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            position: employee.position
        };

        sessionStorage.setItem(
            "adminAccount",
            JSON.stringify(adminAccount)
        );

        showDashboard(adminAccount);
    });

    function renderDashboard() {
        const orders = getOrders();

        const totalOrders = orders.length;

        const revenue = orders.reduce(function (sum, order) {
            return sum + Number(order.total || 0);
        }, 0);

        const totalProductsSold = orders.reduce(function (sum, order) {
            const items = Array.isArray(order.items)
                ? order.items
                : [];

            return sum + items.reduce(function (itemSum, item) {
                return itemSum + Number(item.quantity || 0);
            }, 0);
        }, 0);

        totalOrdersElement.textContent = totalOrders;
        totalRevenueElement.textContent = formatMoney(revenue);

        if (totalProductsSoldElement) {
            totalProductsSoldElement.textContent = totalProductsSold;
        }

        renderOrders(orders);
        renderBestSelling(orders);
    }

    function renderOrders(orders) {
        orderList.innerHTML = "";

        if (orders.length === 0) {
            orderList.textContent = "Chưa có đơn hàng nào.";
            return;
        }

        orders.forEach(function (order) {
            const row = document.createElement("tr");

            const customerName =
                order.customer?.name || "Khách hàng";

            const date = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("vi-VN")
                : "Không rõ";

            const values = [
                order.orderId || "Không rõ",
                customerName,
                date,
                formatMoney(order.total),
                order.status || "Chưa xác định"
            ];

            values.forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            orderList.appendChild(row);
        });
    }

    function renderBestSelling(orders) {
        const productSales = {};

        orders.forEach(function (order) {
            const products = Array.isArray(order.items)
                ? order.items
                : [];

            products.forEach(function (product) {
                const name =
                    product.title ||
                    product.name ||
                    product.id ||
                    "Sản phẩm";

                const quantity = Number(product.quantity || 0);

                productSales[name] =
                    (productSales[name] || 0) + quantity;
            });
        });

        bestSelling.innerHTML = "";

        const sortedProducts = Object.entries(productSales)
            .sort(function (a, b) {
                return b[1] - a[1];
            });

        if (sortedProducts.length === 0) {
            bestSelling.textContent =
                "Chưa có dữ liệu sản phẩm bán chạy.";
            return;
        }

        const ul = document.createElement("ul");

        sortedProducts.forEach(function (product) {
            const li = document.createElement("li");

            li.textContent =
                product[0] + " - Đã bán: " + product[1];

            ul.appendChild(li);
        });

        bestSelling.appendChild(ul);
    }

    try {
        const savedAdmin = JSON.parse(
            sessionStorage.getItem("adminAccount")
        );

        if (
            savedAdmin &&
            savedAdmin.position &&
            savedAdmin.position.toLowerCase() === "admin"
        ) {
            showDashboard(savedAdmin);
        }
    } catch (error) {
        console.error("Lỗi phiên đăng nhập:", error);
        sessionStorage.removeItem("adminAccount");
    }

    logoutButton.addEventListener("click", function () {
        sessionStorage.removeItem("adminAccount");
        location.reload();
    });
});
