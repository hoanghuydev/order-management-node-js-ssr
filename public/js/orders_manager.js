document.addEventListener('DOMContentLoaded', function () {
    // {{!-- Show Loading --}}
    $('#formUpdateOrder').on('submit', function () {
        $('#loadingIndicator').removeClass('d-none').addClass('d-flex');
    });
    $('#orderDelete').on('submit', function () {
        $('#loadingIndicator').removeClass('d-none').addClass('d-flex');
    });
    $('#formPayOrder').on('submit', function () {
        $('#loadingIndicator').removeClass('d-none').addClass('d-flex');
    });
    // {{!-- Show toast --}}

    const url = new URL(window.location.href);
    const query = url.searchParams;
    if (query.get('update_order') === 'success') {
        const toastElement = document.getElementById('liveToast');
        const toastBootstrap = new bootstrap.Toast(toastElement);
        toastBootstrap.show();
    }
    // {{!-- Show banking modal --}}

    let userId;
    let wageAmount;
    let orderCode;
    const bankModal = document.getElementById('bankingInfo');
    if (bankModal) {
        bankModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            userId = button.getAttribute('data-user-id');
            wageAmount = button.getAttribute('data-wage-amount');
            orderCode = button.getAttribute('data-order-code');

            fetch('/users/info/' + userId)
                .then((user) => user.json())
                .then((user) => {
                    let bankQr = `https://img.vietqr.io/image/${user.bankCode}-${user.bankNumber}-compact2.png?amount=${wageAmount}&addInfo=${orderCode}&accountName=${user.bankHolder}`;
                    let bankText = `<strong>Họ và tên tài khoản web: </strong>${user.fullName}.<br><strong>Chủ tài khoản: </strong>${user.bankHolder}.<br> <strong>Số tài khoản: </strong> ${user.bankNumber}.<br> <strong>Mã ngân hàng :</strong> ${user.bankCode}`;
                    $('#loadingQRCode')
                        .removeClass('d-flex')
                        .addClass('d-none');
                    $('#bankingImg').attr('src', bankQr);
                    $('#bankingText').html(bankText);
                });
        });
        bankModal.addEventListener('hidden.bs.modal', function (event) {
            $('#loadingQRCode').removeClass('d-none').addClass('d-flex');
            $('#bankingImg').attr('src', '');
            $('#bankingText').html('');
        });
    }

    // {{!-- Show Modal Delete Order --}}
    let orderId;
    const deleteForm = document.forms['delete-order-form'];
    const deleteorderModal = document.getElementById('deleteorder');
    if (deleteorderModal) {
        deleteorderModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            orderId = button.getAttribute('data-order-id');
        });
    }
    $('.btn-delete-order').on('click', function () {
        deleteForm.action = `/orders/delete/${orderId}?_method=DELETE`;
        deleteForm.submit();
    });
    // {{!-- Change status to Đã thanh toán --}}
    function validateFormPay() {
        const checked = $("input:checkbox[name^='orderIds']:checked").length;
        if (!checked) {
            $('#payOrder').attr('disabled', '');
        } else {
            $('#payOrder').removeAttr('disabled');
        }
    }
    validateFormPay();
    $("input:checkbox[name^='orderIds']").on('change', function () {
        validateFormPay();
    });
});

// {{!-- Get order with filter  --}}
document.addEventListener('DOMContentLoaded', function () {
    // {{!-- convert query string from obj query --}}
    function convertToQueryString(data) {
        const queryString = Object.entries(data)
            .filter(
                ([key, value]) =>
                    value !== '' && value !== undefined && value !== null
            )
            .map(
                ([key, value]) =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
            )
            .join('&');
        return queryString;
    }
    // {{!-- Get order --}}

    function getOrderFilter(dataFilter) {
        return new Promise((resolve, reject) => {
            const queryString = convertToQueryString(dataFilter);
            const ordersListElement = $('.list-order');
            $.ajax({
                url: '/orders/api/filter?' + queryString,
                method: 'GET',
                dataType: 'json',
                success: function (orders) {
                    console.log(queryString);
                    resolve(orders);
                },
                error: function (error) {
                    console.error('Error:', error);
                    reject(error);
                },
            });
        });
    }
    function initPagination() {
        // Set up initial data for pagination
        let currentPage = 1;
        const pageSize = 20; // Number of items per page

        // Function to fetch and display orders based on pagination
        function displayOrders(page) {
            $('.list-order').empty();
            $('.list-order').append(`
            <div class='d-flex w-100 mt-3'>
              <div class="spinner-border m-auto" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          `);
            let dataFilter = {
                shopId: $('#shopId').val(),
                status: $('#status').val(),
                userId: $('#userId').val(),
                buyerPay: $('#buyerPay').val(),
                orderCode: $('#orderCode').val(),
                pageNumber: page,
                pageSize: pageSize,
            };

            getOrderFilter(dataFilter)
                .then((result) => {
                    const orders = result.orders;
                    const totalOrders = result.totalOrders;

                    // Update your UI with the fetched orders

                    // Example: Update the list of orders
                    updateOrderList(orders);

                    // Example: Update the pagination display
                    updatePagination(page, totalOrders);
                })
                .catch((error) => {
                    console.error('Error fetching orders:', error);
                });
        }

        // Example: Update your order list based on the fetched orders
        function updateOrderList(orders) {
            const ordersListElement = $('.list-order');
            ordersListElement.empty();
            for (let i = 0; i < orders.length; i++) {
                const order = orders[i];
                const htmlOrder = `
            <tr>
                <td>${
                    order.status === 'Chờ thanh toán'
                        ? `<input type="checkbox" value="${order._id}" name="orderIds" style="width: 20px;height: 20px;">`
                        : ''
                }</td>
                <td>${order.orderCode}</td>
                <td data-bs-toggle="modal" data-bs-target="#bankingInfo" data-order-code="${
                    order.orderCode
                }" data-user-id="${order.userId}" data-wage-amount="${
                    order.wageAmount
                }" id="btnShowBankInfo" >${order.userId}</td>
                <td>${order.shopName}</td>
                <td>${order.purchaseAccount}</td>
                <td>${order.status}</td>
                <td>${order.voucher}</td>
                <td>${order.orderValue}</td>
                <td>${order.wageCode}</td>
                <td>${order.wageAmount}</td>
                <td>${order.buyerPay}</td>
                <td>${order.payFee}</td>
                <td>${order.staticFee}</td>
                <td class="d-flex flex-column justify-content-center align-items-center">
                     <a href="/orders/edit/${
                         order._id
                     }" class="btn btn-primary mx-2"><i class="fa-solid fa-pen-to-square text-white"></i></a>
                    <div class="btn btn-danger " data-bs-toggle="modal" data-bs-target="#deleteorder" data-order-id="${
                        order._id
                    }"><i class="fa-solid fa-trash text-white"></i></div>
                </td>
            </tr>
          `;
                ordersListElement.append(htmlOrder);
            }
        }

        // Example: Update the pagination display
        function updatePagination(currentPage, totalItems) {
            $('#paginationOrder').twbsPagination('destroy'); // Destroy existing pagination
            $('#paginationOrder').twbsPagination({
                totalPages: Math.ceil(totalItems / pageSize),
                visiblePages: 5,
                startPage: currentPage,
                onPageClick: function (event, page) {
                    // Fetch and display orders for the clicked page
                    displayOrders(page);
                },
                initiateStartPageClick: false,
            });
        }

        // Initial display of orders and pagination
        displayOrders(currentPage);
    }
    initPagination();

    //    {{!-- Filter when --}}
    $('#btnFilterOrder').click(() => {
        initPagination();
    });
});
