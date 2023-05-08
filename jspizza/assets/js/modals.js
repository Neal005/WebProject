
const modals = `
<div class="modal-register">
<div class="register-container rounded-2">
  <div class="close-button rounded-2">
    <i class="fa-solid fa-xmark"></i>
  </div>
  <div class="login-title">
    <h2 class="text-uppercase">đăng ký thành viên</h2>
    <p>Chào mừng bạn đến với pizza</p>
  </div>
  <div class="form-container">
    <div>
      <form id="form-register" action="search.html" method="POST">
        <div class="form-info d-lg-flex">

          <div class="form-group-left col-lg-6">
            <div class="form-group">
              <label class="form-item-name d-block fw-bold" for="">Tên*</label>
              <input name="name" class="form-item-input content-input rounded-2 border-1" type="text">
              <div class="error-message"></div>
            </div>
            <div class="form-group-1">
              <div class="birthday-gender d-flex">
                <div class="form-group birthday col-5">
                  <label class="form-item-name d-block fw-bold" for="">Ngày sinh*</label>
                  <input name="birthday" class="form-item-input content-input rounded-2 border-1" type="date">
                  <div class="error-message"></div>
                </div>

                <div class="form-group gender col-7">
                  <label class="form-item-name d-block fw-bold" for="">Giới tính*</label>
                  <div name="gender" class="form-item-input d-flex justify-content-start rounded-2 border-0">
                    <div class="gender-radio">
                      <input type="radio" name="gender-selection" value="male">
                      <p class="d-inline-block">Nam</p>
                    </div>
                    <div class="gender-radio">
                      <input type="radio" name="gender-selection" value="female">
                      <p class="d-inline-block">Nữ</p>
                    </div>
                    <div class="gender-radio">
                      <input type="radio" name="gender-selection" value="other">
                      <p class="d-inline-block">Khác</p>
                    </div>
                  </div>
                  <div class="error-message"></div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-item-name d-block fw-bold" for="">Email*</label>
              <input name="email" class="form-item-input content-input rounded-2 border-1" type="email">
              <div class="error-message"></div>
            </div>
            <div class="form-group">
              <label class="form-item-name d-block fw-bold" for="">Số điện thoại*</label>
              <input name="phone-number" class="form-item-input content-input rounded-2 border-1" type="text">
              <div class="error-message"></div>
            </div>
          </div>

          <div class="form-group-right col-lg-6">
            <div class="form-group cell-form-password">
              <label class="form-item-name d-block fw-bold" for="">Mật khẩu*</label>
              <input name="password" class="form-item-input content-input rounded-2 border-1" type="password">
              <i class="fa-regular fa-eye show-password"></i>
              <i class="fa-regular fa-eye-slash hidden-password"></i>
              <div class="error-message"></div>
            </div>
            <div class="form-group cell-form-password">
              <label class="form-item-name d-block fw-bold" for="">Nhập lại mật khẩu*</label>
              <input name="confirm-password" class="form-item-input content-input rounded-2 border-1" type="password">
              <i class="fa-regular fa-eye show-password"></i>
              <i class="fa-regular fa-eye-slash hidden-password"></i>
              <div class="error-message"></div>
            </div>
            <div style="margin-top: 16px;"></div>
            <div class="note-register p-2">
              <div class="content">
                <div class="fw-bold">Lưu ý:</div>
                <div>
                  <i class="fa-solid fa-circle-exclamation icon-warning"></i>
                  <span class="ps-1">(*): phần bắt buộc</span>
                </div>
                <div>
                  <i class="fa-solid fa-circle-exclamation icon-warning"></i>
                  <span class="ps-1">Mật khẩu chứa ít nhất 8 ký tự</span>
                </div>
                <div>
                  <i class="fa-solid fa-circle-exclamation icon-warning"></i>
                  <span class="ps-1">Độ tuổi đăng ký tối thiểu 16 tuổi</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-constraint">
          <div class="constraint-content align-items-center">
            <div class="content d-flex">
              <input name="checkbox" type="checkbox">
              <p class="context">Tôi đồng ý trở thành Thành viên PizzaHot và chấp nhận các Điều khoản & Điều kiện và Chính sách bảo mật của PizzaHot.</p>
            </div>
            <div class="error-message"></div>
          </div>
        </div>

        <div class="form-submit d-flex justify-content-center">
          <div class="button-submit">
            <button class="text-uppercase fw-bold border-0 rounded-5" type="submit">đăng ký</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>
</div>

<div class="modal-login">
  <div class="login-container rounded-2">
    <div class="close-button rounded-2">
      <i class="fa-solid fa-xmark"></i>
    </div>
    <div class="login-title">
      <h2 class="text-uppercase">đăng nhập</h2>
      <p>Welcome to back!</p>
    </div>
    <form action="" id="form-login">
      <div class="form-group">
        <label class="form-item-name d-block fw-bold" for="">Email*</label>
        <input name="email" class="form-item-input content-input rounded-2 border-1" type="email">
        <div class="error-message"></div>
      </div>
      <div class="form-group cell-form-password">
        <label class="form-item-name d-block fw-bold" for="">Mật khẩu*</label>
        <input name="password" class="form-item-input content-input rounded-2 border-1" type="password">
        <i class="fa-regular fa-eye show-password"></i>
        <i class="fa-regular fa-eye-slash hidden-password"></i>
        <div class="error-message"></div>
      </div>
      <div class="form-submit d-flex justify-content-center">
        <div class="button-submit">
          <button class="text-uppercase fw-bold border-0 rounded-5" type="submit">đăng nhập</button>
        </div>
      </div>
    </form>
    <div class="hint-register p-2">
      <p>Bạn chưa có tài khoản ?
        <span class="link-register">Đăng ký ngay</span>
        hoặc xem thêm về Chính sách quyền lợi thành viên tại cửa hàng của chúng tôi.
      </p>
    </div>
  </div>
  </div>

<div class="modal-register-successfull">
<div class="alert d-grid">
  <h1 class="mb-3">Chúc mừng bạn đã đăng ký thành công</h1>
  <i class="fa-regular fa-circle-check"></i>
  <div class="return-main-page d-flex justify-content-center align-items-center p-1">
    <a href="index.html">Trở về trang chủ</a>
  </div>
</div>
</div>

<div class="modal-register-failed">
<div class="alert d-grid">
  <h1 class="mb-3">Tài khoản đã tồn tại</h1>
  <i class="fa-solid fa-circle-exclamation icon-warning"></i>
  <div class="return-main-page d-flex justify-content-center align-items-center p-1">
    <span class="link-login">Đăng nhập</span>
  </div>
</div>
</div>

<div class="modal-login-successfull">
<div class="alert d-grid">
  <h1 class="mb-3">Đăng nhập thành công</h1>
  <i class="fa-regular fa-circle-check"></i>
  <div class="return-main-page d-flex justify-content-center align-items-center p-1">
    <a href="index.html">Trở về trang chủ</a>
  </div>
</div>
</div>

<div class="modal-login-failed">
<div class="alert d-grid">
  <h1 class="mb-3">Bạn chưa có tài khoản</h1>
  <i class="fa-solid fa-circle-exclamation icon-warning"></i>
  <div class="return-main-page d-flex justify-content-center align-items-center p-1">
    <span class="link-register-from-login">Đăng ký ngay</span>
  </div>
</div>
</div>`

const modalsElement = document.querySelector('.modals');
modalsElement.innerHTML = modals;
